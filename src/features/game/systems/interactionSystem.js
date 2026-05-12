export function findNearestOverlapTarget({ scene, Phaser, player, interactionZone, group, kind }) {
  const candidates = [];

  scene.physics.overlap(interactionZone, group, (_zone, target) => {
    if (target?.active && target.ecoquest?.kind === kind) {
      candidates.push(target);
    }
  });

  if (!candidates.length) return null;

  return candidates.sort(
    (a, b) =>
      Phaser.Math.Distance.Between(player.x, player.y, a.x, a.y) -
      Phaser.Math.Distance.Between(player.x, player.y, b.x, b.y)
  )[0];
}

export function getInteractionPrompt(target) {
  if (!target?.ecoquest) return null;
  const data = target.ecoquest;

  const text =
    data.kind === "trash"
      ? `Ambil ${data.label}`
      : data.kind === "npc"
        ? `Bicara dengan ${data.label}`
        : `Sorting di ${data.label}`;

  return { key: "E", text };
}
