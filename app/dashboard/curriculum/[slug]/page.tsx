import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Play } from 'lucide-react';

interface CurriculumPageProps {
  params: {
    slug: string;
  };
}

export default async function CurriculumArticlePage({ params }: CurriculumPageProps) {
  const { slug } = params;
  
  // Securely resolve the file path within the local content directory
  const contentDir = path.join(process.cwd(), 'content', 'curriculum');
  const filePath = path.join(contentDir, `${slug}.md`);

  // 404 if the article doesn't exist
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  // Read file and parse YAML frontmatter
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);

  // Determine if a linked tool bridge is required
  const isBoxBreathing = frontmatter.linked_tool === 'box_breathing';

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-12 flex flex-col items-center">
      
      {/* Utility Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-10 pb-4 border-b border-white/10">
        <Link href="/dashboard/curriculum" className="text-slate-500 hover:text-slate-300 transition-colors flex items-center text-[10px] font-mono uppercase tracking-widest">
          <ArrowLeft size={12} className="mr-2" />
          Back to Hub
        </Link>
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          {frontmatter.duration || 'Reading Time: N/A'}
        </span>
      </div>

      {/* Article Content */}
      <article className="w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-[#faf9f6] mb-8 tracking-wide">
          {frontmatter.title || 'Untitled Protocol'}
        </h1>
        
        {/* Tailwind Typography Plugin Configuration */}
        <div className="prose prose-invert prose-slate prose-p:text-slate-300 prose-headings:text-[#faf9f6] max-w-none font-light leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-a:text-[#818cf8] hover:prose-a:text-white marker:text-slate-500">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>

      {/* The linked_tool Interactive Bridge CTA */}
      {isBoxBreathing && (
        <div className="w-full max-w-3xl mt-16 pt-10 border-t border-white/10 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#81b29a] animate-pulse" />
            <p className="text-[10px] text-[#81b29a] font-mono tracking-widest uppercase">
              Interactive Protocol Available
            </p>
          </div>
          
          <Link 
            href="/dashboard/curriculum" 
            className="w-full md:w-auto px-8 py-4 bg-slate-100 text-slate-900 rounded border border-white/20 font-mono text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            <Play size={14} />
            Initiate Protocol: Box Breathing
          </Link>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-4 text-center max-w-xs leading-relaxed">
            Selecting this will redirect you to the secure crisis tools environment.
          </p>
        </div>
      )}

    </div>
  );
}
