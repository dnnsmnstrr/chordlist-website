import {parse, stringify} from 'yaml';
import {definitionSchema, type MotionDefinition} from './schema';

// Reading and writing content/motion/<slug>.md, shared by the wizard's store and the render script
// so a file the wizard writes is exactly the file the build reads. The frontmatter is the definition
// plus the date it was created; the body is the caption.

export type DefinitionFile = {definition: MotionDefinition; caption: string; created: string};

export function parseDefinitionFile(source: string, where: string): DefinitionFile {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${where} has no frontmatter.`);
  const {created, ...data} = (parse(match[1] ?? '') ?? {}) as Record<string, unknown>;
  const parsed = definitionSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'definition'}: ${issue.message}`);
    throw new Error(`${where}: ${issues.join('; ')}`);
  }
  return {definition: parsed.data, caption: (match[2] ?? '').trim(), created: typeof created === 'string' ? created : ''};
}

export function serializeDefinitionFile({definition, caption, created}: DefinitionFile) {
  const frontmatter = stringify({...definition, created}, {lineWidth: 0}).trimEnd();
  return `---\n${frontmatter}\n---\n\n${caption.trim()}\n`;
}
