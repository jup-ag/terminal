import * as React from 'react';

interface IWarningIconProps extends React.SVGProps<SVGSVGElement> {}

const WarningIcon: React.FunctionComponent<IWarningIconProps> = (props) => {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="8" y="6" width="4" height="10" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.8634 15.6962C17.5539 15.1565 11.3038 4.37041 10.7692 3.44957C10.4179 2.8452 9.58075 2.85511 9.22912 3.44957C8.83702 4.11227 2.55515 14.9396 2.11839 15.7235C1.7984 16.2978 2.15189 17.0509 2.88009 17.0509H17.0974C17.7586 17.0509 18.2502 16.3695 17.8635 15.696L17.8634 15.6962ZM10.0005 15.6277C9.50937 15.6277 9.11108 15.2297 9.11108 14.7383C9.11108 14.247 9.50937 13.8489 10.0005 13.8489C10.4918 13.8489 10.8899 14.247 10.8899 14.7383C10.8899 15.2297 10.4918 15.6277 10.0005 15.6277ZM10.5341 12.7817C10.5341 13.1374 10.3562 13.3154 10.0005 13.3154C9.64474 13.3154 9.46681 13.1375 9.46681 12.7817L8.93314 7.62324C8.93314 7.08957 9.28887 6.5559 10.0005 6.5559C10.7119 6.5559 11.0678 7.08957 11.0678 7.62324L10.5341 12.7817Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default WarningIcon;
