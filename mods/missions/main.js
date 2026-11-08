import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { appHome, readTextFile, writeTextFile, theme } from "herdr";

// Missions: a small to-do list in the side panel. Add with Enter, click a
// mission (or its box) to cross it off, the pen to edit, x to strike it
// from the record. Saved to data/missions/missions.json.

const FILE = () => `${appHome()}/data/missions/missions.json`;
const SERIF = "Constantia";
const stop = (_e, cx) => cx.stop_propagation();

export default class Missions extends View {
  init(_props, cx) {
    this.items = [];
    this.snapshot = null; // the file text we last read or wrote, for safe writes
    this.loaded = false;
    this.editing = null;
    this.error = null;
    this.draft = InputState.new({ placeholder: "A new mission…" });
    this.draft.on("submit", (_e, cx) => this.add(cx));
    this.edit = InputState.new({ placeholder: "Mission" });
    this.edit.on("submit", (_e, cx) => this.commitEdit(cx));
    this.edit.on("blur", (_e, cx) => this.commitEdit(cx));
    cx.spawn(async (cx) => {
      try {
        const text = await readTextFile(FILE());
        this.snapshot = text;
        const data = text ? JSON.parse(text) : null;
        this.items = Array.isArray(data?.missions) ? data.missions : [];
      } catch (e) {
        this.error = `Could not read missions: ${e?.message ?? e}`;
      }
      this.loaded = true;
      cx.notify();
    });
  }

  save(cx) {
    const text = JSON.stringify({ missions: this.items }, null, 2) + "\n";
    const expected = this.snapshot;
    this.snapshot = text;
    cx.spawn(async (cx) => {
      try {
        await writeTextFile(FILE(), text, expected);
        this.error = null;
      } catch (e) {
        // Someone else changed the file: reload theirs, keep nothing stale.
        this.error = `Not saved: ${e?.message ?? e}`;
        const fresh = await readTextFile(FILE()).catch(() => null);
        this.snapshot = fresh;
      }
      cx.notify();
    });
  }

  add(cx) {
    const text = this.draft.value().trim();
    if (!text) return;
    this.items.push({ id: `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text, done: false, created: new Date().toISOString() });
    this.draft.set_value("");
    this.save(cx);
    cx.notify();
  }

  toggle(id, cx) {
    const m = this.items.find((x) => x.id === id);
    if (!m) return;
    m.done = !m.done;
    m.done ? (m.completed = new Date().toISOString()) : delete m.completed;
    this.save(cx);
    cx.notify();
  }

  remove(id, cx) {
    this.items = this.items.filter((x) => x.id !== id);
    if (this.editing === id) this.editing = null;
    this.save(cx);
    cx.notify();
  }

  startEdit(id, cx) {
    const m = this.items.find((x) => x.id === id);
    if (!m) return;
    this.editing = id;
    this.edit.set_value(m.text);
    this.edit.focus();
    cx.notify();
  }

  commitEdit(cx) {
    if (!this.editing) return;
    const m = this.items.find((x) => x.id === this.editing);
    const text = this.edit.value().trim();
    this.editing = null;
    if (m && text && text !== m.text) { m.text = text; this.save(cx); }
    cx.notify();
  }

  clearDone(cx) {
    this.items = this.items.filter((x) => !x.done);
    this.save(cx);
    cx.notify();
  }

  row(t, m) {
    const editing = this.editing === m.id;
    const box = div().id(`box-${m.id}`).size(16).flex_none().rounded(2).border_1()
      .border_color(m.done ? t.accent : t.input).bg(m.done ? t.accent : "#00000000")
      .flex().items_center().justify_center().cursor_pointer()
      .hover((s) => s.border_color(t.accent))
      .on_mouse_down("left", stop)
      .on_click((_e, cx) => this.toggle(m.id, cx))
      .when(m.done, (el) => el.child(svg("mods/missions/check.svg").size(12).text_color(t.accent_foreground)));
    const tool = (id, icon, tip, fn) => div().id(id).flex_none().p(3).rounded(3).text_color(t.dim).cursor_pointer()
      .hover((s) => s.bg(t.hover).text_color(t.foreground)).tooltip(tip)
      .on_mouse_down("left", stop).on_click((_e, cx) => fn(cx))
      .child(svg(`mods/missions/${icon}.svg`).size(13));
    const body = editing
      ? div().id(`edit-${m.id}`).flex_1().min_w(0).h(26).px(6).flex().items_center().rounded(3).border_1().border_color(t.accent).bg(t.input)
          .on_mouse_down("left", stop).child(Input.new(this.edit).w_full().text_size(13))
      : div().id(`text-${m.id}`).flex_1().min_w(0).text_size(13).cursor_pointer()
          .text_color(m.done ? t.dim : t.foreground).when(m.done, (el) => el.line_through())
          .on_click((_e, cx) => this.toggle(m.id, cx))
          .child(m.text);
    return h_flex().id(`m-${m.id}`).px(10).py(6).gap(8).items_center().rounded(3)
      .hover((s) => s.bg(t.hover))
      .child(box).child(body)
      .when(!editing, (el) => el.child(tool(`pen-${m.id}`, "pen", "Edit", (cx) => this.startEdit(m.id, cx))))
      .child(tool(`x-${m.id}`, "x", "Remove", (cx) => this.remove(m.id, cx)));
  }

  render() {
    const t = theme();
    const open = this.items.filter((m) => !m.done);
    const done = this.items.filter((m) => m.done);
    const section = (label, n) => h_flex().px(10).pt(10).pb(2).gap(6).items_center()
      .text_size(11).font_semibold().text_color(t.dim).child(label).child(div().text_color(t.dim).child(String(n)));
    return v_flex().size_full().min_h(0).bg(t.surface).font_family(SERIF)
      .child(h_flex().h(40).flex_none().px(12).items_center().gap(8).border_b(1).border_color(t.border)
        .child(svg("mods/missions/missions.svg").size(15).text_color(t.accent))
        .child(div().text_size(14).font_semibold().text_color(t.foreground).child("Missions"))
        .child(div().flex_1())
        .when(done.length > 0, (el) => el.child(div().id("clear-done").px(6).py(2).rounded(3).text_size(11).text_color(t.muted)
          .cursor_pointer().hover((s) => s.bg(t.hover).text_color(t.foreground))
          .on_mouse_down("left", stop).on_click((_e, cx) => this.clearDone(cx)).child("Clear completed"))))
      .child(div().p(10).flex_none()
        .child(div().id("draft").h(32).px(9).flex().items_center().rounded(3).border_1().border_color(t.input).bg(t.input)
          .on_mouse_down("left", stop).child(Input.new(this.draft).w_full().text_size(13))))
      .when(Boolean(this.error), (el) => el.child(div().px(12).pb(6).text_size(11).text_color(t.blocked).child(this.error)))
      .child(v_flex().id("mission-list").flex_1().min_h(0).overflow_y_scrollbar().pb(10)
        .when(this.loaded && !this.items.length, (el) => el.child(div().px(12).pt(14).text_size(12).text_color(t.dim)
          .child("No missions. Type one above and press Enter.")))
        .when(open.length > 0, (el) => el.child(section("Open", open.length)).children(open.map((m) => this.row(t, m))))
        .when(done.length > 0, (el) => el.child(section("Completed", done.length)).children(done.map((m) => this.row(t, m)))));
  }
}
