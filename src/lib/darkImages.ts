/**
 * Pictures that have a copy made for the dark page, at the same path ending
 * in `.dark.png`. The copy has no pale plate behind it: labels, captions and
 * arrows drawn straight on the see-through background are turned light, and
 * anything inside a solid body (a phone screen, a white card) is untouched.
 * `scripts/make-dark-image.py` makes one; the settings each picture needed
 * are in HANDOFF-v2.md.
 */
const WITH_DARK_COPY = new Set<string>([
  "/case/1MeOVEBvOGnOx8hi8SWSqyAG1lU.png",
  "/case/7qcKT122ZJVDc2Paih8U6pkWwDs.png",
  "/case/CedlfXpFrJY8EXvd7JkVSFFIUo.png",
  "/case/D5kodJ1CD0Cjg7IhFE0pqpadrRI.png",
  "/case/GyTFSVEROuIS9A2t6v7auAAyo.png",
  "/case/ODUF40NzVYFLwC6n63ckMD5FY.png",
  "/case/R4QNcJcHWmiPn8uwiqRdpZP43Q.png",
  "/case/T52XV12BcXFyv9VUac5hG6uEE9g.png",
  "/case/TiWQE7JDRoA2Uw2psZXUDkOqD24.png",
  "/case/Yq6Pbh5kfTFnt4CgDN7K8JhcYLI.png",
  "/case/dU8zzf1NLNV9xV6KJ1ua3ocYhc.png",
  "/case/fzF5n4Ff6g9fa90YW4Q4fBSm3Co.png",
  "/case/k9u4Ty2OAji64lIZlRF0SYyFmg.png",
  "/case/oUBlOSx88XZWYIKfSJrzZbV0E.png",
  "/case/pNyfX9DrGQ19Zt7RnUUADVb24.png",
  "/case/qJMNLto7fdjSEa2nYM4IQinS1uI.png",
  "/case/rVYcn7al7gIYMqYcqgmTpTnNKHw.png",
  "/case/sBEweLasNhWBXDBcOUGtbYZFNHg.png",
  "/case/uG6UgyeylPUQYscl6pJUW8XM.png",
  "/case/wDPo1NTuWfkIl1pEa8YhSFa3ehQ.png",
  "/case/y2WHxFY8x6y1DfdzC3rFDqsTI.png",
  "/case/z1sqGS2uRo1HdtIjVlPi9HiTGE.png",
]);

export function darkSrc(src: string): string | null {
  return WITH_DARK_COPY.has(src) ? src.replace(/\.png$/, ".dark.png") : null;
}
