import fs from 'fs';

const path = 'components/widgets/telephony/CustomWebDialerIframe.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    "import { motion, AnimatePresence } from 'framer-motion';\n",
    ""
);

fs.writeFileSync(path, data, 'utf8');
console.log("Fixed CustomWebDialerIframe.tsx");
