import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { model, targetLang } = await request.json();

    const backendPath = path.join(process.cwd(), 'backend');
    const envPath = path.join(process.cwd(), '..', '.env');
    
    // Map targetLang to actual language names
    const langMap: Record<string, string[]> = {
      english: ['English'],
      spanish: ['Spanish'],
      both: ['English', 'Spanish'],
    };

    const languages = langMap[targetLang] || ['English'];

    const pythonScript = `
import sys
import os
sys.path.append(r'${backendPath}')
from dotenv import load_dotenv
load_dotenv(r'${envPath}')

from post_to_threads import ContentGenerator
import google_sheets

model = '${model}'
languages = ${JSON.stringify(languages)}
sheet_map = {'English': '영어', 'Spanish': '스페인어'}

# Get all content from default sheet
contents = google_sheets.get_all_from_queue()

if not contents:
    print("번역할 콘텐츠가 없습니다.")
else:
    generator = ContentGenerator(model=model)
    
    for i, text in enumerate(contents):
        for lang in languages:
            translated = generator.translate(text, lang)
            google_sheets.append_to_sheet(translated, sheet_name=sheet_map[lang])
            print(f"[{i+1}/{len(contents)}] {lang} 번역 완료")
    
    print(f"완료: {len(contents)}개 번역됨")
`;

    const { stdout, stderr } = await execAsync(`python -c "${pythonScript.replace(/"/g, '\\"')}"`, {
      maxBuffer: 1024 * 1024 * 10,
      cwd: backendPath,
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('Error:', stderr);
    }

    return NextResponse.json({
      success: true,
      message: '✅ 번역이 완료되었습니다.',
      output: stdout,
    });
  } catch (error: any) {
    console.error('Translate error:', error);
    return NextResponse.json(
      { error: error.message || '번역 실패' },
      { status: 500 }
    );
  }
}
