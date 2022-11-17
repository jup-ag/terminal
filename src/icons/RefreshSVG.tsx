const RefreshSVG: React.FC<React.SVGAttributes<SVGElement>> = ({ width = '12', height = '12' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 12 12" fill="inherit" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_841_4053)">
        <path
          d="M11.6466 4.23513V0.706082L10.4111 1.94156C9.3173 0.741165 7.72912 0 6 0C2.6827 0 0 2.6827 0 6C0 9.3173 2.68203 12 6 12C7.69405 12 9.21142 11.2939 10.3059 10.165L9.31797 9.14128C8.50601 10.0234 7.30561 10.5879 6 10.5879C3.45892 10.5879 1.41216 8.5411 1.41216 6.00002C1.41216 3.45894 3.45892 1.41218 6 1.41218C7.34135 1.41218 8.57615 2.01238 9.42317 2.92954L8.11757 4.23515L11.6466 4.23513Z"
          fill="inherit"
        />
      </g>
      <defs>
        <clipPath id="clip0_841_4053">
          <rect width={width} height={height} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RefreshSVG;
