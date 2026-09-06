import tokens from '../../design/tokens.json' with { type: 'json' }

export { tokens }

export function campaign(name = 'ink') {
  const theme = tokens.campaigns[name]
  if (!theme) throw new Error(`Unknown design campaign: ${name}`)
  return { ...theme, iconTile: tokens.brand.tile, iconGlyph: tokens.brand.glyph }
}
