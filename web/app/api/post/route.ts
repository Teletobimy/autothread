import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { postLang, interval } = await request.json();

    const backendPath = path.join(process.cwd(), 'backend');
    const envPath = path.join(process.cwd(), '..', '.env');
    
    // Map postLang to sheet names
    const sheetMap: Record<string, string[]> = {
      default: ['쓰레드'],
      english: ['영어'],
      spanish: ['스페인어'],
      both: ['영어', '스페인어'],
    };

    const sheets = sheetMap[postLang] || ['쓰레드'];

    const pythonScript = `
import sys
import time
import os
sys.path.append(r'${backendPath}')
from dotenv import load_dotenv
load_dotenv(r'${envPath}')

from post_to_threads import me, _post_text_to_threads
import google_sheets

sheets = ${JSON.stringify(sheets)}
interval = ${interval}
token = os.getenv('LONG_LIVED_ACCESS_TOKEN')

if not token:
    print("LONG_LIVED_ACCESS_TOKEN이 설정되지 않았습니다.")
    sys.exit(1)

try:
    user = me(token=token)
    user_id = user['id']
    username = user.get('username', 'N/A')
    print(f"로그인: @{username}")
except Exception as e:
    print(f"Threads 인증 실패: {e}")
    sys.exit(1)

count = 0
while True:
    sheet_idx = count % len(sheets)
    current_sheet = sheets[sheet_idx]
    
    print(f"[{current_sheet}] 시트에서 게시글 가져오는 중...")
    
    try:
        text, row_index = google_sheets.pop_from_queue(sheet_name=current_sheet)
        
        if not text:
            print(f"[{current_sheet}] 시트가 비어있습니다.")
            if len(sheets) == 1:
                print("모든 게시 완료!")
                break
            else:
                count += 1
                continue
        
        print(f"게시 중: {text[:50]}...")
        result = _post_text_to_threads(user_id, text, token)
        
        if result and 'permalink' in result:
            print(f"게시 성공! {result['permalink']}")
            count += 1
        else:
            print(f"게시 실패")
            if row_index:
                google_sheets.mark_as_failed(current_sheet, row_index)
            count += 1
        
        print(f"{interval}분 대기 중...")
        time.sleep(interval * 60)
        
    except Exception as e:
        print(f"오류: {e}")
        time.sleep(60)
`;

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const python = spawn('python', ['-c', pythonScript], {
          cwd: backendPath,
          shell: true,
        });

        python.stdout.on('data', (data) => {
          const text = data.toString();
          controller.enqueue(encoder.encode(text + '\n'));
        });

        python.stderr.on('data', (data) => {
          const text = data.toString();
          if (!text.includes('Warning')) {
            controller.enqueue(encoder.encode(`⚠️ ${text}\n`));
          }
        });

        python.on('close', (code) => {
          controller.enqueue(
            encoder.encode(`\n🏁 프로세스 종료 (코드: ${code})\n`)
          );
          controller.close();
        });

        python.on('error', (error) => {
          controller.enqueue(encoder.encode(`❌ 오류: ${error.message}\n`));
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Post error:', error);
    return NextResponse.json(
      { error: error.message || '게시 실패' },
      { status: 500 }
    );
  }
}
