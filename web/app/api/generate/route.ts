import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { model, prompt, count } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다' },
        { status: 400 }
      );
    }

    const backendPath = path.join(process.cwd(), 'backend');
    const envPath = path.join(process.cwd(), '..', '.env');
    
    // Escape single quotes in prompt for shell
    const escapedPrompt = prompt.replace(/'/g, "'\\''").replace(/\\/g, '\\\\');
    
    // Python command to generate content
    const pythonScript = `
import sys
import os
sys.path.append(r'${backendPath}')
from dotenv import load_dotenv
load_dotenv(r'${envPath}')

from post_to_threads import ContentGenerator
import google_sheets

model = '${model}'
prompt = '''${escapedPrompt}'''
count = ${count}

generator = ContentGenerator(model=model)

for i in range(count):
    if i == 0:
        text = generator.generate(prompt)
    else:
        text = generator.generate("위의 지침에 따라 새로운 게시글을 하나 더 작성해줘. (이전과 겹치지 않게)")
    
    google_sheets.append_to_sheet(text)
    print(f"[{i+1}/{count}] 저장 완료")

print(f"완료: {count}개 저장됨")
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
      message: `✅ ${count}개의 콘텐츠가 구글 스프레드시트에 저장되었습니다.`,
      output: stdout,
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error.message || '생성 실패' },
      { status: 500 }
    );
  }
}
