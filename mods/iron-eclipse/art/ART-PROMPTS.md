# Iron Eclipse art

Generated with the Hermes image backend (openai-codex, gpt-image-2-medium).
All characters are original, in a late-1990s cel-anime dark-fantasy style.
They are not copies of any existing franchise's characters.

Files:
- art/sidebar-v6.png: the layout's sidebar background. Fortress, war camp, and forest, cropped to 268:900 at 0.8 brightness.
- art/field-v4.png: the background behind the terminals. A battlefield under an eclipse, lifted with gamma 0.5.
- ../iron-agents/portraits/*.png: 160px agent faces. The names are axeman, general, sergeant, hermit, minstrel, archer, inquisitor and executioner.

Herdr caches a background by its filename. When you replace one, save it under a new -vN name,
update layouts/iron-eclipse.json, and switch layouts away and back.

Shared portrait prompt prefix:
Bust portrait, late-1990s hand-painted cel anime still, dark medieval fantasy, thick ink
outlines, hard two-tone cel shading, heavy black shadows, muted earthy palette with
blood-red accents, film grain, VHS-era color. Head and shoulders, three-quarter view facing
right, centered with headroom above the head, plain dark near-black background with a faint
red glow behind the head, no text, no logo, no border. Original character: <description>
