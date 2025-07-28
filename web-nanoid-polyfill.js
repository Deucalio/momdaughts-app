// web-nanoid-polyfill.js
import { nanoid } from 'nanoid/non-secure';
global.nanoid = nanoid;