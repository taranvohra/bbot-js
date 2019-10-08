import Jimp from 'jimp';
import fontkit from 'fontkit';

const FONTS = (async () => {
  const ubuntuTTF = fontkit.openSync('assets/Ubuntu-Medium.ttf');
  const ubuntuFNT = await Jimp.loadFont('assets/ubuntu.fnt');
  const arialFNT = await Jimp.loadFont('assets/arial.fnt');

  return {
    arialFNT,
    ubuntuFNT,
    ubuntuTTF,
  };
})();

export { FONTS };
