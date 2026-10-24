export default function VideoCallSVG({ h, w }) {
  return (
    <svg
      viewBox="0 0 48 48"
      version="1"
      xmlns="http://www.w3.org/2000/svg"
      enable-background="new 0 0 48 48"
      fill="#000000"
      className={`h-${h} w-${w}`}
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0" />

      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          fill="#000000"
          d="M8,12h22c2.2,0,4,1.8,4,4v16c0,2.2-1.8,4-4,4H8c-2.2,0-4-1.8-4-4V16C4,13.8,5.8,12,8,12z"
        />{" "}
        <polygon fill="#000000" points="44,35 34,29 34,19 44,13" />{" "}
      </g>
    </svg>
  );
}
