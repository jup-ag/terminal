const ApproxSVG = ({ width = 16, height = 16 }: { width?: string | number; height?: string | number }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="inherit" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.8573 8.18429L13.6323 5.95933L10.8573 3.73438V5.31937H3.32735V6.59937H10.8573V8.18429ZM5.14223 7.81429L2.36719 10.0393L5.14223 12.2642V10.6792H12.6722V9.39922H5.14223V7.81429Z"
        fill="inherit"
      />
    </svg>
  );
};

export default ApproxSVG;
