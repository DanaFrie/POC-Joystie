import { SIGNUP_INVITE_WHATSAPP_ICON } from '@/constants/onboarding-figma';

/** 18×18 — Figma 12703:42221 WhatsApp CTA. */
export function SignupWhatsAppIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SIGNUP_INVITE_WHATSAPP_ICON}
      alt=""
      width={18}
      height={18}
      className="shrink-0 object-contain"
    />
  );
}

/** 18×18 — copy link (user-provided SVG). */
export function SignupCopyLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M6.28861 14.25C6.61682 15.4392 7.70643 16.3125 9 16.3125H12C13.5533 16.3125 14.8125 15.0533 14.8125 13.5V7.5C14.8125 6.20643 13.9392 5.11682 12.75 4.78861V10.5C12.75 12.5711 11.0711 14.25 9 14.25H6.28861Z"
        fill="white"
      />
      <path
        d="M6 1.6875C4.4467 1.6875 3.1875 2.9467 3.1875 4.5V10.5C3.1875 12.0533 4.4467 13.3125 6 13.3125H9C10.5533 13.3125 11.8125 12.0533 11.8125 10.5V4.5C11.8125 2.9467 10.5533 1.6875 9 1.6875H6Z"
        fill="white"
      />
    </svg>
  );
}

/** 18×18 — alarm / remind later (user-provided SVG). */
export function SignupAlarmIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M9 2.4375C13.0386 2.4375 16.3125 5.71142 16.3125 9.75C16.3125 13.7886 13.0386 17.0625 9 17.0625C4.96142 17.0625 1.6875 13.7886 1.6875 9.75C1.6875 5.71142 4.96142 2.4375 9 2.4375ZM9 6C8.58579 6 8.25 6.33579 8.25 6.75V9.48242C8.25 9.90036 8.4589 10.2906 8.80664 10.5225L10.834 11.874C11.1786 12.1038 11.6443 12.0107 11.874 11.666C12.1038 11.3214 12.0107 10.8557 11.666 10.626L9.75 9.34863V6.75C9.75 6.33579 9.41421 6 9 6Z"
        fill="white"
      />
      <path
        d="M12.75 1.5L15.75 3.75"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 1.5L9 3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.75 15.75L13.5 17.25"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.25 15.75L4.5 17.25"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.25 1.5L2.25 3.75"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 24×24 — alert in together-info card (12914:11767). */
export function SignupChildInviteAlertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M12 8V12M12 16H12.01M10.29 3.86L1.82 18C1.64538 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5318 3.56611 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4682 3.56611 10.29 3.86Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
