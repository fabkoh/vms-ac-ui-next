import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

export const Logo = styled((props) => {
  const { variant, ...other } = props;

  const color = variant === 'light' ? '#C1C4D6' : '#5048E5';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="375" viewBox="0 0 375 375" height="375" version="1.0" {...other}><defs><clipPath id="a"><path d="M 130 29 L 371.125 29 L 371.125 350 L 130 350 Z M 130 29"/></clipPath></defs><path fill="#63C6F1" d="M 241.554688 280.789062 C 270.257812 264.945312 295.976562 244.917969 318.070312 221.675781 C 290.714844 245.886719 258.691406 265.351562 223.019531 278.496094 C 209.929688 283.316406 196.351562 287.296875 182.332031 290.332031 C 178.148438 291.238281 173.96875 292.039062 169.792969 292.761719 C 174.335938 297.269531 179.136719 301.496094 184.164062 305.429688 C 204.371094 299.027344 223.550781 290.726562 241.554688 280.789062"/><path fill="#63C6F1" d="M 52.035156 253.21875 C 71.671875 255.015625 91.675781 255.261719 111.914062 253.835938 C 120.660156 270.066406 132.328125 284.273438 146.089844 295.898438 C 122.023438 298.128906 98.207031 297.433594 75.050781 294.046875 C 65.578125 281.597656 57.820312 267.859375 52.035156 253.21875 Z M 41.1875 172.148438 C 58.488281 176.242188 76.300781 178.976562 94.511719 180.261719 C 94.222656 190.375 94.980469 200.667969 96.886719 211.019531 C 98.121094 217.71875 99.796875 224.226562 101.875 230.519531 C 81.839844 229.355469 62.175781 226.488281 43.050781 222.035156 C 40.042969 205.9375 39.316406 189.171875 41.1875 172.148438 Z M 65.851562 100.578125 C 72.53125 102.769531 79.34375 104.695312 86.261719 106.375 C 95.335938 108.574219 104.601562 110.332031 114.039062 111.601562 C 105.691406 126.03125 99.785156 141.925781 96.765625 158.636719 C 95.121094 158.347656 93.488281 158.039062 91.855469 157.726562 C 76.234375 154.75 61.003906 150.648438 46.273438 145.464844 C 50.6875 129.316406 57.34375 114.253906 65.851562 100.578125 Z M 183.363281 358.980469 C 151.246094 353.804688 122.683594 339.941406 99.675781 320.175781 C 118.019531 319.472656 136.554688 317.175781 155.121094 313.15625 C 158.996094 312.316406 162.835938 311.398438 166.644531 310.425781 C 181.402344 319.054688 197.699219 325.121094 214.84375 328.128906 C 166.191406 308.570312 128.101562 265.691406 116.824219 210.71875 C 116.597656 209.632812 116.367188 208.550781 116.167969 207.457031 C 105.75 150.910156 126.109375 95.820312 165.347656 59.457031 C 149.058594 69.203125 135.003906 81.980469 123.796875 96.871094 C 111.601562 94.3125 99.757812 90.886719 88.316406 86.679688 C 85.019531 85.46875 81.75 84.203125 78.523438 82.859375 C 82.910156 77.484375 87.621094 72.398438 92.605469 67.617188 C 129.808594 31.953125 182.660156 13.542969 237.425781 22.367188 C 267.207031 27.164062 293.933594 39.441406 316.007812 56.964844 C 290.734375 33.078125 258.292969 16.265625 221.398438 10.320312 C 181.558594 3.90625 142.675781 11.144531 109.507812 28.59375 C 61.167969 54.027344 24.964844 101.148438 15.625 159.296875 C -0.121094 257.347656 66.476562 349.613281 164.375 365.382812 C 201.265625 371.328125 237.34375 365.550781 268.820312 350.804688 C 242.367188 360.511719 213.152344 363.777344 183.363281 358.980469"/><g clip-path="url(#a)"><path fill="#CBF9E5" d="M 211.441406 29.703125 C 182.050781 29.703125 154.523438 37.660156 130.875 51.53125 C 149.316406 43.453125 169.683594 38.960938 191.097656 38.960938 C 274.183594 38.960938 341.539062 106.417969 341.539062 189.628906 C 341.539062 217.953125 333.726562 244.449219 320.152344 267.082031 C 293.855469 310.945312 245.902344 340.296875 191.097656 340.296875 C 169.683594 340.296875 149.316406 335.804688 130.875 327.726562 C 154.523438 341.597656 182.050781 349.554688 211.441406 349.554688 C 282.214844 349.554688 342.226562 303.4375 363.171875 239.570312 C 368.324219 223.855469 371.125 207.070312 371.125 189.628906 C 371.125 101.304688 299.632812 29.703125 211.441406 29.703125"/></g><path fill="#63C6F1" d="M 196.789062 171.867188 C 237.707031 162.035156 275.675781 144.691406 309.179688 121.382812 C 275.839844 140.539062 238.6875 153.816406 199.113281 159.789062 C 198.0625 163.730469 197.28125 167.761719 196.789062 171.867188"/><path fill="#63C6F1" d="M 133.675781 230.902344 C 132.796875 230.929688 131.917969 230.960938 131.039062 230.984375 C 133.40625 237.859375 136.207031 244.496094 139.410156 250.871094 C 144.25 250.167969 149.054688 249.375 153.824219 248.488281 C 168.460938 245.777344 182.753906 242.226562 196.664062 237.890625 C 208.460938 251.382812 224.636719 260.632812 242.507812 263.765625 C 215.578125 252.941406 194.601562 228.960938 188.945312 198.269531 C 183.292969 167.574219 194.34375 137.671875 215.644531 117.9375 C 198.992188 127.898438 186.648438 143.691406 180.84375 162.007812 C 172.222656 162.804688 163.5 163.257812 154.6875 163.347656 C 143.980469 163.457031 133.394531 163.011719 122.945312 162.078125 C 122.324219 168.34375 122.046875 174.691406 122.171875 181.09375 C 141.140625 180.882812 159.714844 179.074219 177.789062 175.835938 C 176.785156 183.746094 176.960938 191.941406 178.480469 200.199219 C 180.132812 209.175781 183.25 217.507812 187.519531 225.007812 C 179.898438 226.441406 172.179688 227.640625 164.363281 228.578125 C 154.074219 229.816406 143.839844 230.570312 133.675781 230.902344"/><path fill="#63C6F1" d="M 153.84375 101.363281 C 149.960938 101.019531 146.109375 100.578125 142.285156 100.066406 C 139.847656 104.476562 137.617188 109 135.597656 113.632812 C 187.953125 116.464844 237.84375 104.019531 280.769531 80.0625 C 242.246094 97.386719 198.898438 105.375 153.84375 101.363281"/><path fill="#63C6F1" d="M 205.230469 221.21875 C 207.222656 225.257812 209.507812 229.109375 212.054688 232.738281 C 255.75 216.976562 295.308594 193.355469 329.265625 163.742188 C 292.875 190.320312 250.996094 210.167969 205.230469 221.21875"/></svg>
  );
})``;

Logo.defaultProps = {
  variant: 'primary'
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['light', 'primary'])
};
