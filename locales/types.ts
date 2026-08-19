/// The shape of a copy object, with its wording set free.
///
/// `en.ts` is declared `as const`, so `typeof homeCopy` is a type made of the English sentences
/// themselves — useful there, useless as a contract for a translation, which by definition holds
/// different strings. `Localized` walks that type and replaces every string literal with `string`,
/// keeping everything else: the keys, the nesting, and the length of tuples like the three
/// showcase screenshots.
///
/// Copy that interpolates a value is a function, so those are mapped to a function of the same
/// arguments returning a `string` — a translation gets to reorder the sentence around the value
/// while still being callable by the component that renders it.
///
/// The effect is that a translation must be structurally complete. Add a key to `en.ts` and every
/// locale that has not translated it fails to compile, rather than silently rendering English.
export type Localized<T> = T extends string
  ? string
  : T extends number | boolean | null | undefined
    ? T
    : T extends (...args: infer Args) => string
      ? (...args: Args) => string
      : { readonly [Key in keyof T]: Localized<T[Key]> }
