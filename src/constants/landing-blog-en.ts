/**
 * English knowledge-center articles — mirrors LANDING_BLOG slugs/assets.
 */
import { LANDING_ASSETS, type LandingBlogPost } from '@/constants/landing-marketing';

export const LANDING_BLOG_EN: readonly LandingBlogPost[] = [
  {
    slug: 'youtube-empty-home',
    author: 'Meir Nitzan',
    avatar: LANDING_ASSETS.founderAvatar,
    title: 'In two simple steps: how to make YouTube’s home screen boring',
    excerpt:
      'YouTube can be a great tool or an addictive drug. When the home screen is empty like a Google search, kids choose on purpose what to watch.',
    image: LANDING_ASSETS.ideaYoutube,
    thumb: LANDING_ASSETS.thumbYoutube,
    body: [
      {
        type: 'p',
        text: 'In talks I’m often asked about YouTube Shorts; it turns out plenty of adults spend hours with it late into the night… But what about the kids? In many homes the computer account belongs to a parent, and the kids who use it are exposed to YouTube - which can be an excellent, helpful tool, but also a truly addictive substance.',
      },
      { type: 'figure' },
      {
        type: 'p',
        text: 'It can be different in two simple steps.',
      },
      {
        type: 'p',
        text: 'YouTube’s default home screen encourages addiction: the moment we or our kids open the app, we’re flooded with suggestions tailored exactly to our preferences. In practice, we learn that YouTube is a platform that doesn’t ask us to think - just like candy or a cigarette. Kids enter a world where the algorithm drives the brain from the first second. They develop an emotional dependence on what the algorithm offers and waste hours on fleeting content.',
      },
      {
        type: 'p',
        text: 'You can change that. You can turn YouTube into a useful tool that trains kids for intentional use every time they open the app or a browser tab.',
      },
      {
        type: 'p',
        text: 'In two super-easy steps, YouTube’s opening screen becomes boring. When YouTube’s screen is empty, like a Google search — we get a moment of intention. We and our kids choose on purpose what to watch, instead of being pulled in. That dramatically lowers device dependence and addictive consumption.',
      },
      {
        type: 'h',
        text: 'What do you do?',
      },
      {
        type: 'ol',
        items: [
          'Turn off Autoplay (automatic play of the next video)',
          'Clear and pause watch history (it can feel scary, but you can still find everything you want).',
        ],
      },
      {
        type: 'howto',
        title: 'What to do in practice',
        items: [
          {
            title: 'Turn off Autoplay',
            intro: 'The steps in the YouTube app are almost identical on both operating systems.',
            paths: [
              {
                label: 'From the player',
                steps: [
                  'While watching a video, tap the screen and switch Autoplay (at the top of the video) to off.',
                ],
              },
              {
                label: 'From app settings',
                steps: [
                  'Tap your profile picture or the “You” tab at the bottom of the screen.',
                  'Tap the settings icon (gear).',
                  'Choose “Autoplay”.',
                  'Turn the switch off.',
                ],
              },
            ],
            note: 'Recommended: under Settings > General, also turn off “Muted playback in feeds” so videos don’t start playing by themselves while you scroll.',
          },
          {
            title: 'Clear and pause watch history',
            steps: [
              'Open the app and tap your profile picture or “You”.',
              'Tap the settings icon (gear).',
              'Choose “Manage all history”.',
              'To delete existing history: tap “Delete” at the top → “Delete all time”.',
              'To pause future history: go to the “Controls” tab and turn videos off, or tap “Turn off”.',
            ],
          },
        ],
      },
      {
        type: 'h',
        text: 'What happens on computer and TV after the change?',
      },
      {
        type: 'p',
        text: 'If the computer and TV are signed into the same Google account, the changes work like this:',
      },
      {
        type: 'p',
        text: 'Watch history (clearing the home screen): history is tied to the Google account. Once watch history is deleted and paused on mobile, the change applies immediately on every device. YouTube’s home screen becomes empty of recommendations and algorithm on both computer and TV, and mainly shows the search bar.',
      },
      {
        type: 'p',
        text: 'Autoplay: this setting is managed per device. Turning off Autoplay on the phone will not turn it off on the TV or computer. To stop automatic next-video play there too, turn the switch off once on the computer (at the bottom of the video player) and on the TV (in the TV app settings).',
      },
      {
        type: 'p',
        text: 'Instead of opening YouTube to “unwind,” your kids will practice intention - a little more every day.',
      },
    ],
  },
  {
    slug: 'ai-kids-attention-motivation-creativity',
    author: 'Dvir Frishtik',
    avatar: LANDING_ASSETS.dvirAvatar,
    title: 'Attention, motivation, and creativity in AI-generation kids',
    excerpt:
      'The broad impact of using AI in the most important period when our brains are shaped and the things we should do.',
    image: LANDING_ASSETS.ideaAiGeneration,
    thumb: LANDING_ASSETS.thumbAiGeneration,
    body: [
      {
        type: 'p',
        text: 'Our kids are going to grow up with AI. Period. How big will its role in their lives be? We still don’t know exactly. But it will be involved. A lot.',
      },
      {
        type: 'p',
        text: 'When they don’t know something, an answer will be waiting.',
      },
      {
        type: 'p',
        text: 'When they need to write, they’ll have a personal digital writer available.',
      },
      {
        type: 'p',
        text: 'When they look for one idea, they can pull ten in seconds.',
      },
      {
        type: 'p',
        text: 'Getting information and creating digitally will become unimaginably easy.',
      },
      {
        type: 'p',
        text: 'That raises a deep question for me and for many others:',
      },
      {
        type: 'p',
        text: 'What happens to a child when the path from “I want something” to “I got it” keeps getting shorter?',
      },
      { type: 'figure' },
      {
        type: 'h',
        text: 'Our brain isn’t built only for reward - it’s also built to chase it',
      },
      {
        type: 'p',
        text: 'We tend to talk about dopamine as the “pleasure chemical,” but its role is much more complex. Dopamine is mostly released when we’re on the way to a reward — working hard, like our ancestors, to earn it. That’s how evolution raised us to survive on this planet.',
      },
      {
        type: 'p',
        text: 'Think of a child who works an hour on a drawing / finally solves a hard problem / builds something in Lego again and again until it stands / or trains for weeks to land a new soccer move.',
      },
      {
        type: 'p',
        text: 'The satisfaction, the dopamine, the high - none of that comes only from the result.',
      },
      {
        type: 'p',
        text: 'A big part comes from the hard path to get there.',
      },
      {
        type: 'p',
        text: 'Research clearly shows that effort shapes how the brain’s reward system responds to the outcome. Worked hard? The dopamine you earned feels higher quality and lasts longer. Didn’t work at all? The dopamine feels cheaper, and the crash comes sooner than expected.',
      },
      {
        type: 'p',
        text: 'And that’s exactly where AI changes the equation.',
      },
      {
        type: 'h',
        text: 'What happens when effort disappears?',
      },
      {
        type: 'p',
        text: 'A child stuck on writing can ask AI to write.',
      },
      {
        type: 'p',
        text: 'A girl who doesn’t know how to start a drawing can get twenty directions instantly.',
      },
      {
        type: 'p',
        text: 'Homework, a story, a presentation, a curious question — many moments that used to be “I don’t know, let’s see how I figure this out” now get an immediate answer.',
      },
      {
        type: 'p',
        text: 'The problem isn’t the answer, of course. (Which, by the way, still needs checking and judgment - important skills that are also becoming less obvious in the AI era.)',
      },
      {
        type: 'p',
        text: 'The problem is that that uncomfortable stuck moment is also where many of the skills we want in our kids develop: patience, persistence, problem-solving, imagination. All of those grow from the ability to stay with a task even when it doesn’t reward us right away.',
      },
      {
        type: 'h',
        text: 'All of this connects to attention, too',
      },
      {
        type: 'p',
        text: 'Attention, as we all know, is a very slippery commodity and not only for kids.',
      },
      {
        type: 'p',
        text: 'The AI generation meets technology at peak power, already full of fast rewards: the next video, a new message, a new game, a new answer.',
      },
      {
        type: 'p',
        text: 'If there’s almost always a faster way to a stimulus or a result, it necessarily becomes harder to choose the path that actually requires effort.',
      },
      {
        type: 'h',
        text: 'And what about creativity?',
      },
      {
        type: 'p',
        text: 'Creativity doesn’t always start with a brilliant idea.',
      },
      {
        type: 'p',
        text: 'Often it starts from sheer boredom and endless attempts.',
      },
      {
        type: 'p',
        text: 'We try something, delete, get bored, look around, make a mistake, try again and along the way things happen.',
      },
      {
        type: 'p',
        text: 'AI is excellent at generating options.',
      },
      {
        type: 'p',
        text: 'But if it steps in every time before the child has searched for an option themselves, it can turn from a tool that expands creativity into one that may suppress it.',
      },
      {
        type: 'h',
        text: 'So what are you saying keep kids away from AI?',
      },
      {
        type: 'p',
        text: 'Of course not. We all know you can’t, and shouldn’t stop progress.',
      },
      {
        type: 'p',
        text: 'AI will be part of their world, and using it wisely will become a critical skill.',
      },
      {
        type: 'p',
        text: 'Our challenge as parents isn’t to stop them from using it, but to help them understand when to use it and when it’s better to stay alone with the task.',
      },
      {
        type: 'h',
        text: 'What can we do?',
      },
      {
        type: 'p',
        text: 'Use the phone less. That simple.',
      },
      {
        type: 'p',
        text: 'How available Gemini or ChatGPT is will decide how much a child uses AI while learning life — especially in the critical stages when the brain is being shaped.',
      },
      {
        type: 'p',
        text: 'Dramatically cutting phone use naturally raises activities that need mental effort (slow dopamine, but high quality): a book, making art, music, sports, play, building — and even a little, heaven forbid, boredom.',
      },
      {
        type: 'h',
        text: 'When you do use the phone, work with a clear strategy:',
      },
      {
        type: 'ul',
        items: [
          'You first, then AI — before running to chat, try. Before asking for ideas, bring at least one of your own.',
          'Use AI as a partner, not a replacement — instead of having AI create everything from scratch, ask it guiding questions, give feedback, or help improve an idea that already exists. You can set that personality up front in the chat interface of OpenAI, Google, or Anthropic.',
          'Celebrate the effort too — not only “what a beautiful drawing,” but also “I saw how many times you tried until you got it, you’re a star.”',
        ],
      },
    ],
  },
  {
    slug: 'dunning-kruger-kids',
    author: 'Meir Nitzan',
    avatar: LANDING_ASSETS.founderAvatar,
    title: 'The Dunning–Kruger effect: how to teach kids to distinguish between a real expert to a pretend one',
    excerpt:
      'In an age when everyone became an expert, how will our kids know what a good product is, who a good teacher is, and how to treat advice with lots of likes?',
    image: LANDING_ASSETS.ideaDunning,
    thumb: LANDING_ASSETS.thumbDunning,
    body: [
      {
        type: 'p',
        text: 'Not long ago I attended a workshop to upgrade my LinkedIn profile. The speaker’s message was sharp - exaggerate!',
      },
      {
        type: 'p',
        text: '“Your profile is like a wedding; you show up to a wedding dressed nicely, hair done, perfume on, right? That’s different from another night on the couch!” he half-shouted at us. “Your profile is a social meeting at a wedding - dress it up.”',
      },
      {
        type: 'p',
        text: 'It was a fairly fancy workshop meant to make over people lost on social networks (I arrived by accident). One participant asked the speaker innocently: “Umm, if I do some financial consulting on the side, what should I put on my profile?”',
      },
      {
        type: 'p',
        text: '“Expert!” the speaker said firmly.',
      },
      {
        type: 'p',
        text: '“You’re an expert in financial planning,” he repeated, pleased with the whispers in the room, “expert and speaker!”',
      },
      {
        type: 'p',
        text: 'He explained there was no reason to hesitate and that it was time we left the movie we’re living in: “It’s not like anyone’s going to give you a test, right?”',
      },
      {
        type: 'p',
        text: 'It kind of feels like everyone became an expert in something, or a commentator on some topic - and only we small ones aren’t sure we understand anything in the field we work in every day. We have a degree and a half or two, but when people ask our advice we stammer.',
      },
      {
        type: 'p',
        text: 'Have you ever asked yourselves how our kids relate to expertise?',
      },
      {
        type: 'p',
        text: 'If we take our financial advisor as an example, he knows he isn’t an expert - but many people like him sincerely think they are. Unlike fake news, where there’s a clear villain trying to do harm, in the world of “fake experts” there’s usually no bad intent. In an age of short attention spans, the ability to grab attention is often how people make a living.',
      },
      {
        type: 'p',
        text: 'Back to our speaker, whose intentions were good: he’s probably right in the specific case of a social profile - that’s the world we live in - but he also assumes that someone who casually describes themselves as a financial advisor won’t go advise the finance minister just because they added “expert” to their title.',
      },
      {
        type: 'p',
        text: 'But will our kids understand that? Will they know he wrote it for a job interview? And in general, how will they know what a good product is, who a good teacher is, and how to treat advice that has lots of likes?',
      },
      {
        type: 'p',
        text: 'This kind of “expertise” is called the Dunning–Kruger effect. On one side, people with little knowledge who overrate themselves; on the other, an outstanding PhD student or a plumber with ten years of experience who hesitates when stating a view on something they know well.',
      },
      { type: 'figure' },
      {
        type: 'p',
        text: 'It happens for reasons with names like cognitive bias or metacognition, but between us it’s what we call arrogance — that moment when positive feedback makes us feel important and pushes us to try again. If I’m honest, I fall for it too sometimes; today’s world pushes the “I” outward: “build your brand,” “differentiate yourself.” A whole world of behavior design pushes all of us to be experts. We all have that friend who delivers geopolitical briefings after a few minutes of scrolling “Abu Ali Express.”',
      },
      {
        type: 'p',
        text: 'The ability to examine information and think critically must be a foundation for a student in the new era. How do you tell reliable information from nonsense? How do you read critically? How do you ask deep questions? And what should you ask the teacher in class today?',
      },
      {
        type: 'h',
        text: 'So what do we do?',
      },
      {
        type: 'p',
        text: 'First, we teach our kids about technology. Unless they’ll live in space or an Amish community, critical reading and knowledge reliability are basic tools. Our kids need to understand what artificial intelligence is and that not everything written was written by people. To develop critical thinking they need to understand why people make products (for money); they need knowledge that explains how we consume information and what forces drive markets and the economy. Yes, even at their young age.',
      },
      {
        type: 'p',
        text: 'For a long time I’ve tried to explain to my daughters that I won’t spend money on mall claw machines — the ones where you put in five shekels and never catch a plastic ball full of unclear goo. “I think it’s a waste of money,” I tell them, but my daughters, quite cleverly, steer the conversation to my other wastes and I get tangled in half-baked answers (“Want to use them? Use your own money”).',
      },
      {
        type: 'p',
        text: 'Last summer I came prepared; I knew I needed a strong argument. I wanted them to understand a video-game maker’s main consideration. “No, he doesn’t want you happy and joyful,” I said, using a racing game as an example; I told them he’d make sure they finish feeling “more,” not satisfied. I even ran a little simulation: “The moment you’re at the peak of a lap and want to finish it, the game ends. What do you think you’ll want to do — stop playing or keep going?”',
      },
      {
        type: 'p',
        text: 'For now, that front is quiet.',
      },
      {
        type: 'h',
        text: 'What else can we do?',
      },
      {
        type: 'p',
        text: 'Researchers who studied this suggest something fairly refreshing - strengthen the figure of the teacher. They suggest turning the teacher into a kind of judge of information, a role model, explaining how they prepare a lesson, asking critical questions during class, and especially answering “I don’t know” a lot. If the teacher is also a model for being able to err and correct, or for critical thinking, the researchers argue, students will develop the tools needed for 2024.',
      },
      {
        type: 'p',
        text: 'At home and in class, alongside acquiring information, a student needs tools to verify it. It isn’t enough to repeat again and again the “fact” (?) that screen time is bad for the eyes; it’s also worth checking whether that’s still true for screens made in 2024. Challenge our own assertions and teach kids critical thinking - including about the things we’re really experts in, and maybe especially those.',
      },
    ],
  },
  {
    slug: 'screen-time-intentionality',
    author: 'Meir Nitzan',
    avatar: LANDING_ASSETS.founderAvatar,
    title: 'From the age kids get a smartphone to parenting that teaches healthy use',
    excerpt:
      'The average age for a first smartphone is 6.2. The solution isn’t parent-as-cop vs child-as-thief of screen time — it’s intentionality and delayed gratification from day one.',
    image: LANDING_ASSETS.ideaScreenTime,
    thumb: LANDING_ASSETS.thumbScreenTime,
    body: [
      {
        type: 'p',
        text: 'Kids’ daily screen time became a real nuisance this year. The latest Bezeq report finds that the average age at which a child gets their first smartphone is 6.2 (yes, that’s the average!).',
      },
      { type: 'figure' },
      {
        type: 'p',
        text: 'But inside the report hides an even more significant figure that hints at the future trend: it isn’t positive. The report shows that the pace of technology adoption is the fastest ever. Add the anxiety that has accompanied us in recent years because of the security situation, and you get a dangerous formula that may lead kids to get a device even younger.',
      },
      {
        type: 'p',
        text: 'Elementary-school ages, and especially the years when a child gets their first smartphone, are critical for building identity and decision-making ability. Those are the years when the brain’s decision-making region develops, and at that age we want an optimal environment where the child learns to decide through play or dealing with complexity they can grow from. Giving a smartphone to a six-year-old without guidance is like a parent handing over car keys before 16, or alcohol at eight; the child simply isn’t ready yet.',
      },
      {
        type: 'p',
        text: 'When a child gets the device at that age, our goal should be teaching “intentionality”, using technology so that the person chooses the next step, not the machine.',
      },
      {
        type: 'p',
        text: 'Why does that matter so much? Because if the child (and of course we adults too) mainly uses the smartphone as an escape — a place where the brain can disconnect from reality and get a “dose” of social or emotional excitement - use becomes addictive. It’s a snowball; once a habit forms, as every parent knows, it’s very hard to go back.',
      },
      {
        type: 'h',
        text: 'So what’s the solution?',
      },
      {
        type: 'p',
        text: 'Many researchers tried to compare smartphone dependence to other addictions without enough success. It clearly isn’t a substance addiction like a drug or nicotine, and it isn’t gambling either, because smartphone access is constant. Others compare it to a diet, but that comparison isn’t precise either: imagine trying to diet with a cheesecake in front of you at every moment — almost impossible.',
      },
      {
        type: 'p',
        text: 'I believe in our case it’s a different kind of compulsive behavior, so it needs a different solution. Existing solutions like blocks or screen-time controls often fail, they turn the parent into a “cop” and the child into a “thief” of screen time. Prof. Jonathan Haidt, one of the leading researchers in the field, suggests going back: from a smartphone-based childhood to a play-based childhood. To do that, we need to teach the child healthy information consumption and help them build motivation for self-regulation and healthy habits.',
      },
      {
        type: 'p',
        text: 'One of the most significant experiments in the field is the “marshmallow experiment” from the 1970s, which tested kids’ ability to wait twenty minutes in a room without eating one marshmallow in order to get two. Findings showed that the kids who succeeded were those who developed delayed-gratification strategies - like playing, ignoring, or closing their eyes. Those kids could delay immediate gratification (a marshmallow or endless scrolling) for something more meaningful later (another marshmallow or playing with friends).',
      },
      {
        type: 'p',
        text: 'So to help kids not get addicted to the screen after they get it at the right age, we need to teach them how to use it well - from the first moment, give them the ability to delay immediate gratification for a stronger, more meaningful future one. That is the technology of the future. In this world we need a paradigm shift: from parenting that fights over screen time, to parenting that educates for healthy use and teaches how.',
      },
    ],
  },
];
