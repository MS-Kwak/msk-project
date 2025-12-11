import { NextRequest, NextResponse } from 'next/server';
import {
  getContactsByName,
  getAllContactNames,
} from '@/actions/contact.action';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 카카오 챗봇으로부터 받은 데이터
    const userMessage = body.userRequest?.utterance || '';
    const params = body.action?.params || {};

    // 파라미터에서 연락처 이름 추출 (@sys.text 사용)
    const contactName = params.contact_name;

    console.log('User message:', userMessage);
    console.log('Contact name parameter:', contactName);

    // contactName이 없으면 userMessage 전체를 검색명으로 사용
    const searchName = contactName || userMessage;

    // 1. "문의"라는 단어가 포함되고 특정 이름이 없는 경우 → 전체 문의 목록
    if (userMessage.includes('문의') && !contactName) {
      try {
        const names = await getAllContactNames();

        // 이름이 없는 경우 처리
        if (names.length === 0) {
          return NextResponse.json(
            {
              version: '2.0',
              template: {
                outputs: [
                  {
                    simpleText: {
                      text: '현재 등록된 문의가 없습니다.',
                    },
                  },
                ],
              },
            },
            { status: 200 }
          );
        }

        const response = {
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: {
                  text: `총 ${names.length}분의 문의가 있습니다.\n문의하신분의 이름을 선택해주세요.`,
                },
              },
            ],
            quickReplies: [
              // 연락처 이름 목록을 quickReplies에 추가 (최대 10개)
              ...names.slice(0, 10).map((name) => ({
                messageText: name,
                action: 'message',
                label: name,
              })),
            ],
          },
        };

        return NextResponse.json(response, { status: 200 });
      } catch (error: any) {
        console.error('Error fetching contact names:', error);
        return NextResponse.json(
          {
            version: '2.0',
            template: {
              outputs: [
                {
                  simpleText: {
                    text: '연락처 목록을 가져오는 중 오류가 발생했습니다.',
                  },
                },
              ],
            },
          },
          { status: 200 }
        );
      }
    }
    // 2. 특정 이름으로 연락처 정보 조회 (파라미터 또는 사용자 입력)
    else {
      // 빈 검색어 처리
      if (!searchName.trim()) {
        return NextResponse.json(
          {
            version: '2.0',
            template: {
              outputs: [
                {
                  simpleText: {
                    text: '검색할 이름을 입력해주세요.',
                  },
                },
              ],
              quickReplies: [
                {
                  messageText: '문의',
                  action: 'message',
                  label: '전체 문의 목록 보기',
                },
              ],
            },
          },
          { status: 200 }
        );
      }

      try {
        const contacts = await getContactsByName(searchName);

        // 해당 이름의 연락처가 없는 경우
        if (contacts.length === 0) {
          // 유사한 이름 검색 제안
          const allNames = await getAllContactNames();
          const similarNames = allNames.filter(
            (name) =>
              name.toLowerCase().includes(searchName.toLowerCase()) ||
              searchName.toLowerCase().includes(name.toLowerCase())
          );

          if (similarNames.length > 0) {
            return NextResponse.json(
              {
                version: '2.0',
                template: {
                  outputs: [
                    {
                      simpleText: {
                        text: `'${searchName}'로 등록된 문의를 찾을 수 없습니다.\n혹시 아래 중 하나를 찾으시는 건가요?`,
                      },
                    },
                  ],
                  quickReplies: [
                    ...similarNames.slice(0, 5).map((name) => ({
                      messageText: name,
                      action: 'message',
                      label: name,
                    })),
                    {
                      messageText: '문의',
                      action: 'message',
                      label: '전체 목록 보기',
                    },
                  ],
                },
              },
              { status: 200 }
            );
          } else {
            return NextResponse.json(
              {
                version: '2.0',
                template: {
                  outputs: [
                    {
                      simpleText: {
                        text: `'${searchName}'로 등록된 문의를 찾을 수 없습니다.\n다른 이름으로 다시 검색해보세요.`,
                      },
                    },
                  ],
                  quickReplies: [
                    {
                      messageText: '문의',
                      action: 'message',
                      label: '전체 문의 목록 보기',
                    },
                  ],
                },
              },
              { status: 200 }
            );
          }
        }

        // 연락처 정보가 있는 경우 - Carousel로 표시
        const response = {
          version: '2.0',
          template: {
            outputs: [
              {
                carousel: {
                  type: 'textCard',
                  items: contacts
                    .slice(0, 10)
                    .map((contact, index) => ({
                      title: `${contact.name}${
                        contacts.length > 1
                          ? ` (${index + 1}/${contacts.length})`
                          : ''
                      }`,
                      description: `문의일: ${new Date(
                        contact.created_at
                      ).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}\n이메일: ${contact.email}\n내용: ${
                        contact.description.length > 80
                          ? contact.description.substring(0, 80) +
                            '...'
                          : contact.description
                      }`,
                      buttons: [
                        {
                          label: '전화하기',
                          action: 'phone',
                          phoneNumber: contact.phone,
                        },
                        {
                          label: '이메일 보내기',
                          action: 'webLink',
                          webLinkUrl: `mailto:${contact.email}?subject=문의 답변&body=안녕하세요 ${contact.name}님,`,
                        },
                      ],
                    })),
                },
              },
            ],
            quickReplies: [
              {
                messageText: '문의',
                action: 'message',
                label: '다른 문의 찾기',
              },
            ],
          },
        };

        return NextResponse.json(response, { status: 200 });
      } catch (error: any) {
        console.error('Error fetching contact:', error);
        return NextResponse.json(
          {
            version: '2.0',
            template: {
              outputs: [
                {
                  simpleText: {
                    text: '연락처 정보를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                  },
                },
              ],
              quickReplies: [
                {
                  messageText: '문의',
                  action: 'message',
                  label: '다시 시도',
                },
              ],
            },
          },
          { status: 200 }
        );
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '서비스 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
              },
            },
          ],
          quickReplies: [
            {
              messageText: '문의',
              action: 'message',
              label: '문의 목록 보기',
            },
          ],
        },
      },
      { status: 200 }
    );
  }
}
