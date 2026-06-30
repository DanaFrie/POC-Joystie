/** Hebrew copy for child funnel — parent role labels from bonding context. */
export function parentCourtLabel(parentGender?: 'female' | 'male' | null): 'אמא' | 'אבא' {
  return parentGender === 'female' ? 'אמא' : 'אבא';
}

/** Court labels — never show raw `male` / `female` or profile names. */
export function resolveParentCourtLabel(
  parentGender?: 'female' | 'male' | null,
  parentName?: string | null
): 'אמא' | 'אבא' {
  if (parentGender === 'female' || parentGender === 'male') {
    return parentCourtLabel(parentGender);
  }
  if (parentName === 'female' || parentName === 'male') {
    return parentCourtLabel(parentName);
  }
  if (parentName === 'אמא' || parentName === 'אבא') {
    return parentName;
  }
  return 'אבא';
}

export function childWaitingForParentReadyMessage(
  parentGender?: 'female' | 'male' | null
): string {
  return childBallGameWaitingForParentMessage(parentGender);
}

/** Child on court — waiting for parent to confirm on `/game`. */
export function childBallGameWaitingForParentMessage(
  parentGender?: 'female' | 'male' | null
): string {
  if (parentGender === 'female') {
    return 'מחכים שאמא תצטרף';
  }
  return 'מחכים שאבא יצטרף';
}

/** Parent on court — waiting for child (join or play-ready). */
export function parentBallGameWaitingForChildMessage(
  childName: string,
  childGender?: 'boy' | 'girl' | null
): string {
  if (childGender === 'girl') {
    return `מחכים ש${childName} תצטרף`;
  }
  return `מחכים ש${childName} יצטרף`;
}

export function parentPlayReadyConfirmLabel(parentGender?: 'female' | 'male' | null): string {
  return parentGender === 'female' ? 'קדימה, אני מוכנה!' : 'קדימה, אני מוכן!';
}

export function childPlayReadyConfirmLabel(
  parentName: string,
  parentGender?: 'female' | 'male' | null
): string {
  const role = parentGender === 'female' ? 'אמא' : 'אבא';
  return parentGender === 'female'
    ? `קדימה, אני ו${role} מוכנות!`
    : `קדימה, אני ו${role} מוכנים!`;
}

export function parentWaitingForChildJoinMessage(
  childName: string,
  childGender?: 'boy' | 'girl' | null
): string {
  return parentBallGameWaitingForChildMessage(childName, childGender);
}

export function parentWaitingForChildReadyMessage(
  childName: string,
  childGender?: 'boy' | 'girl' | null
): string {
  return parentBallGameWaitingForChildMessage(childName, childGender);
}

export function ballGameWaitingHeadline(
  role: 'parent' | 'child',
  opts: {
    childName: string;
    childGender?: 'boy' | 'girl' | null;
    parentGender?: 'female' | 'male' | null;
  }
): string {
  if (role === 'child') {
    return childBallGameWaitingForParentMessage(opts.parentGender);
  }
  return parentBallGameWaitingForChildMessage(opts.childName, opts.childGender);
}

export const BALL_GAME_RETRY_LABEL = 'יאללה, מנסים שוב!';
