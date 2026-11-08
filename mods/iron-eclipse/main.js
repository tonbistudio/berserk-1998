import { View, div, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, theme, layout } from "herdr";

// Crest for the Iron Eclipse layout: a burning eclipse, the name in
// blackletter, and a tally of the agents in battle. Read-only; no programs,
// no network, no files outside this folder.

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// Same rule as the shipped sidebar mods: under 160px the sidebar is a rail.
const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

const BLACKLETTER = "Old English Text MT";
const SERIF = "Constantia";

export default class IronEclipse extends View {
  render() {
    const t = theme();
    const list = agents();
    const count = (s) => list.filter((a) => a.status === s).length;
    const blocked = count("blocked");
    const working = count("working");
    const done = count("done");

    if (narrow()) {
      return v_flex().size_full().items_center().justify_center().bg(t.chrome + "78")
        .child(image("mods/iron-eclipse/eclipse.svg").size(34));
    }

    const tally = h_flex().gap(10).items_center().justify_center()
      .font_family(SERIF).text_size(11.5).text_color(t.muted);
    const part = (n, label, color) => div().text_color(color).child(`${n} ${label}`);
    const parts = [];
    if (blocked) parts.push(part(blocked, blocked === 1 ? "awaits thee" : "await thee", t.blocked));
    if (working) parts.push(part(working, "in battle", t.working));
    if (done) parts.push(part(done, "returned", t.done));
    if (!parts.length) parts.push(div().text_color(t.dim).child(list.length ? "all is still" : "no blades drawn"));
    parts.forEach((p, i) => {
      if (i) tally.child(div().text_color(t.dim).child("·"));
      tally.child(p);
    });

    return v_flex().size_full().items_center().justify_center().gap(4).bg(t.chrome + "78")
      .border_b(1).border_color(t.border)
      // The name as a steel-and-blood wordmark (art/wordmark-v1.png, 760x264).
      .child(image("mods/iron-eclipse/art/wordmark-v1.png").w(244).h(85))
      .child(tally);
  }
}
