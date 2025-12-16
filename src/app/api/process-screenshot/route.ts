import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { serverConfig } from '@/config/server.config';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('API');

const execAsync = promisify(exec);

/**
 * DEPLOYMENT NOTE:
 * 
 * This route uses child_process to run Python scripts, which works locally
 * but will NOT work on Firebase Hosting (no Python runtime).
 * 
 * For production deployment, see: FIREBASE_FUNCTIONS_SETUP.md
 * 
 * Local testing: Works perfectly - just install Python dependencies:
 *   cd services/graph-telemetry && pip install -r requirements.txt
 */

// Uncomment this to use external API service in production:
// const USE_EXTERNAL_API = process.env.PYTHON_API_URL || process.env.FIREBASE_FUNCTION_URL;

interface ProcessScreenshotRequest {
  image: File;
  targetDay: string;
}

export async function POST(request: NextRequest) {
  logger.log('Process screenshot request received');
  
  const formData = await request.formData();
  
  // Uncomment to use external API in production:
  // const externalApiUrl = process.env.PYTHON_API_URL || process.env.FIREBASE_FUNCTION_URL;
  // if (externalApiUrl) {
  //   console.log('[API] Proxying to external API:', externalApiUrl);
  //   const response = await fetch(`${externalApiUrl}/process-screenshot`, {
  //     method: 'POST',
  //     body: formData,
  //   });
  //   const result = await response.json();
  //   return NextResponse.json(result);
  // }
  
  try {
    const imageFile = formData.get('image') as File;
    const targetDay = formData.get('targetDay') as string;

    if (!imageFile) {
      logger.error('No image file provided');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!targetDay) {
      logger.error('No target day provided');
      return NextResponse.json(
        { error: 'No target day provided' },
        { status: 400 }
      );
    }

    logger.log('Processing:', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      targetDay
    });

    // Convert File to Buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary file
    const tempFileName = `screenshot_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const tempFilePath = join(tmpdir(), tempFileName);

    logger.log('Saving temporary file:', tempFilePath);
    await writeFile(tempFilePath, new Uint8Array(buffer));

    try {
      // Get Python script path (works on both Windows and Unix)
      const scriptPath = join(process.cwd(), 'services', 'graph-telemetry', 'graph_telemetry_service.py');
      const apiKey = process.env.GOOGLE_API_KEY || '';

      logger.log('Executing Python script:', {
        scriptPath,
        hasApiKey: !!apiKey,
        targetDay,
        pythonCommandFromEnv: process.env.PYTHON_COMMAND || 'not set'
      });

      // Execute Python script
      // Try different Python commands (for Windows py launcher and different versions)
      // Priority: PYTHON_COMMAND env var -> py -3.11-32 -> py -3.11 -> py -3.12 -> python3 -> python
      // Note: 'py' without version is tried last as it may point to wrong Python
      const envPythonCmd = process.env.PYTHON_COMMAND;
      const pythonCommands = [
        envPythonCmd, // Can be set in .env.local (e.g., "py -3.11-32" or "py -3.11")
        'py -3.11-32', // Try 32-bit Python 3.11 first (if installed)
        'py -3.11', // Try Python 3.11 (any architecture)
        'py -3.12',
        'py -3.10',
        'python3',
        'python',
        'py' // Try generic py last as it may point to wrong version
      ].filter((cmd): cmd is string => {
        // Remove undefined/null and avoid duplicates
        if (!cmd) return false;
        // If env var is set, don't add it again from hardcoded list
        if (envPythonCmd && cmd === envPythonCmd) return false;
        return true;
      });
      
      logger.log('Python commands to try:', pythonCommands);
      
      // Try each Python command until one works
      let stdout = '';
      let stderr = '';
      let lastError: Error | null = null;
      let pythonCmd = '';
      
      // Only include --api-key if it's not empty (avoids argparse issues with empty strings)
      const apiKeyArg = apiKey && apiKey.trim() ? `--api-key "${apiKey}"` : '';
      
      for (const cmd of pythonCommands) {
        if (!cmd) continue; // Skip undefined/null commands
        
        pythonCmd = cmd;
        const command = `${cmd} "${scriptPath}" "${tempFilePath}" "${targetDay}" ${apiKeyArg}`.trim();
        logger.log('Trying Python command:', command);
        
        try {
          // Use shell option for Windows py launcher support
          const execOptions: any = {
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            timeout: serverConfig.api.screenshotProcessingTimeout,
          };
          
          // On Windows, use shell to properly handle 'py -3.11' launcher
          if (process.platform === 'win32') {
            execOptions.shell = true;
          }
          
          const result = await execAsync(command, execOptions);
          stdout = typeof result.stdout === 'string' ? result.stdout : result.stdout.toString('utf-8');
          stderr = typeof result.stderr === 'string' ? result.stderr : result.stderr.toString('utf-8');
          
          // Check if we got valid JSON output
          // Sometimes on Windows, JSON might be in stderr if stdout encoding fails
          const stdoutJson = stdout.trim();
          const stderrJson = stderr.trim();
          
          // Try to find JSON in stdout or stderr
          let jsonFound = false;
          if (stdoutJson && (stdoutJson.startsWith('{') || stdoutJson.includes('"day"'))) {
            jsonFound = true;
          } else if (stderrJson && (stderrJson.startsWith('{') || stderrJson.includes('"day"'))) {
            // JSON might be in stderr due to encoding issues
            stdout = stderrJson;
            jsonFound = true;
          }
          
          if (jsonFound) {
            logger.log('Python command succeeded:', cmd);
            logger.log('Python output (first 200 chars):', stdout.substring(0, 200));
            break; // Success, exit loop
          } else {
            // No JSON found, might be an error
            throw new Error('No valid JSON output from Python script');
          }
        } catch (error: any) {
          // Check if we actually got valid output despite the error (encoding issues)
          const errorStdout = error.stdout ? (typeof error.stdout === 'string' ? error.stdout : error.stdout.toString('utf-8')) : '';
          const errorStderr = error.stderr ? (typeof error.stderr === 'string' ? error.stderr : error.stderr.toString('utf-8')) : '';
          
          // Try to extract JSON from error output (encoding errors still produce valid JSON)
          const combinedOutput = (errorStdout + '\n' + errorStderr).trim();
          const jsonMatch = combinedOutput.match(/\{[\s\S]*"day"[\s\S]*\}/);
          
          if (jsonMatch) {
            // Found JSON despite error - use it!
            stdout = jsonMatch[0];
            stderr = combinedOutput.replace(jsonMatch[0], '').trim();
            logger.log('Python command succeeded (despite encoding error):', cmd);
            logger.log('Extracted JSON from error output');
            break; // Success!
          }
          
          lastError = error;
          const errorMsg = error.message || String(error);
          logger.warn(`Python command failed (${cmd}):`, errorMsg);
          if (combinedOutput) {
            logger.warn(`Error output:`, combinedOutput.substring(0, 500)); // Log first 500 chars
          }
          // Continue to next command
          continue;
        }
      }
      
      // If all commands failed, throw error
      if (!stdout && lastError) {
        throw new Error(
          `Python not found. Tried: ${pythonCommands.join(', ')}. ` +
          `Please install Python 3.11 or 3.12, or set PYTHON_COMMAND in .env.local (e.g., PYTHON_COMMAND="py -3.11")`
        );
      }

      // Python script outputs to stderr for logs, stdout for JSON result
      // Filter out non-JSON lines from stderr (keep only logs)
      const stderrLines = stderr.split('\n');
      const jsonLines = stderrLines.filter(line => line.trim().startsWith('{') || line.includes('"day"'));
      const logLines = stderrLines.filter(line => !line.trim().startsWith('{') && !line.includes('"day"'));
      
      if (logLines.length > 0) {
        logger.log('[Python]', logLines.join('\n'));
      }
      
      // If JSON is in stderr (due to encoding issues), use it
      if (jsonLines.length > 0 && !stdout.trim().startsWith('{')) {
        stdout = jsonLines.join('\n');
        logger.log('Found JSON in stderr (encoding issue), using it');
      }

      logger.log('Python script output:', stdout.substring(0, 500));

      // Parse JSON response - try to extract JSON from output
      let result;
      try {
        // Try to find JSON in the output (might be mixed with logs)
        let jsonStr = stdout.trim();
        
        // If output contains JSON, extract it
        if (jsonStr.includes('{') && jsonStr.includes('}')) {
          const jsonStart = jsonStr.indexOf('{');
          const jsonEnd = jsonStr.lastIndexOf('}') + 1;
          jsonStr = jsonStr.substring(jsonStart, jsonEnd);
        }
        
        result = JSON.parse(jsonStr);
        logger.log('Parsed result:', result);
      } catch (parseError: any) {
        logger.error('Failed to parse JSON. Output:', stdout.substring(0, 500));
        logger.error('Parse error:', parseError.message);
        throw new Error(`Failed to parse Python script output: ${parseError.message}`);
      }

      // Clean up temp file
      await unlink(tempFilePath).catch(err => {
        logger.warn('Failed to delete temp file:', err);
      });

      // Convert minutes to hours for consistency with frontend
      const resultWithHours = {
        ...result,
        time: result.minutes ? result.minutes / 60 : 0,
        minutes: result.minutes || 0,
      };

      logger.log('Returning result:', resultWithHours);
      return NextResponse.json(resultWithHours);

    } catch (execError: any) {
      logger.error('Python script error:', execError);
      
      // Clean up temp file on error
      await unlink(tempFilePath).catch(() => {});

      return NextResponse.json(
        { 
          error: 'Failed to process image',
          details: execError.message || 'Unknown error',
          stderr: execError.stderr
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    logger.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

