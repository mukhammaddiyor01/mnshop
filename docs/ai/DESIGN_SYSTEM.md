# Design system boundary

Existing MNShop visual tokens and behavior remain source-of-truth in the web repository’s `Agent.md`. A future mobile app may share only primitive values: color, spacing, typography names, radii, and semantic status names.

Do not share MUI components, CSS/SCSS, EJS templates, DOM icons, or React Native components. Recreate the same semantic intent with native components and accessibility behavior. Any native design system package needs its own documented feature reason and `feat:` commit.
