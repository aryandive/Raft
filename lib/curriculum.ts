import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CurriculumModuleMeta, CurriculumModuleSchema } from '@/content/curriculum/schema';

const CURRICULUM_DIR = path.join(process.cwd(), 'content/curriculum');


function getMdxFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getMdxFilesRecursively(fullPath));
    } else if (item.isFile() && item.name.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

export async function getAllCurriculumModules(): Promise<CurriculumModuleMeta[]> {
  const mdxFiles = getMdxFilesRecursively(CURRICULUM_DIR);
  const modules: CurriculumModuleMeta[] = [];

  for (const fullPath of mdxFiles) {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    
    try {
      const validatedMeta = CurriculumModuleSchema.parse(data);
      modules.push(validatedMeta);
    } catch (e) {
      console.error(`Validation failed for frontmatter in ${fullPath}`, e);
    }
  }

  // Sort: Foundation track first, then by trackId, layerIndex, moduleIndex
  return modules.sort((a, b) => {
    const aTrack = a.trackId || 'foundation';
    const bTrack = b.trackId || 'foundation';
    
    if (aTrack !== bTrack) {
      if (aTrack === 'foundation') return -1;
      if (bTrack === 'foundation') return 1;
      return aTrack.localeCompare(bTrack);
    }
    
    const aLayer = a.layerIndex ?? 0;
    const bLayer = b.layerIndex ?? 0;
    if (aLayer !== bLayer) {
      return aLayer - bLayer;
    }
    
    return a.moduleIndex - b.moduleIndex;
  });
}

export async function getCurriculumModuleBySlug(slug: string): Promise<{ meta: CurriculumModuleMeta, content: string } | null> {
  const mdxFiles = getMdxFilesRecursively(CURRICULUM_DIR);

  for (const fullPath of mdxFiles) {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    try {
      const validatedMeta = CurriculumModuleSchema.parse(data);
      if (validatedMeta.slug === slug) {
        return { meta: validatedMeta, content };
      }
    } catch (e) {
      // Validation failed, skip
    }
  }
  
  return null;
}

