const ChevronLeftIcon: React.FC<React.SVGAttributes<SVGElement>> = ({ width = '8', height = '14' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1L1 7L7 13" stroke="#1A202C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default ChevronLeftIcon;
