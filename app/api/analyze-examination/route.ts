import { generateText } from 'ai'
import { NextResponse } from 'next/server'

const fallback = (result: string) => {
  const value = result.toLowerCase()
  const red = ['qon ketish', 'hushsiz', 'tutqanoq', 'nafas yetish', 'juda yuqori', 'yurak urishi 180', 'bosim 160'].some((term) => value.includes(term))
  const yellow = ['kamqonlik', 'shish', 'bosim 140', 'og‘riq', 'ogriq', 'harorat 38'].some((term) => value.includes(term))
  return { level: red ? 'Qizil' : yellow ? 'Sariq' : 'Yashil', summary: red ? 'Shoshilinch tibbiy ko‘rik va markazga xabar berish kerak.' : yellow ? 'Yaqin monitoring va shifokor nazorati tavsiya etiladi.' : 'Ko‘rsatkichlar hozircha me’yor doirasida.' }
}

export async function POST(request: Request) {
  const { patient, kind, result = '', image = '' } = await request.json()
  if (!patient || (!result && !image)) return NextResponse.json({ error: 'Bemor va tahlil rasmi majburiy.' }, { status: 400 })
  try {
    const prompt = `Bemor: ${patient}\nTekshiruv turi: ${kind}\nQo‘shimcha izoh: ${result || 'yo‘q'}\nRasmdagi tahlilni diqqat bilan o‘qing. Ko‘rinmagan qiymatlarni taxmin qilmang.`
    const content = image ? [{ type: 'text' as const, text: prompt }, { type: 'image' as const, image }] : prompt
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: 'Siz perinatal monitoring yordamchisisiz. Tibbiy tashxis qo‘ymang. Rasmda laboratoriya, UZI, homiladorlik yoki chaqaloq natijasi bo‘lishi mumkin. Faqat xavf triage qiling. Javobni aynan JSON ko‘rinishida bering: {"level":"Qizil|Sariq|Yashil","summary":"o‘zbekcha qisqa izoh"}. Qizil — shoshilinch xavf, Sariq — yaqin monitoring, Yashil — hozircha norma. Noaniq yoki o‘qib bo‘lmaydigan rasmda Sariq darajani tanlang va qayta yuklashni tavsiya qiling.',
      messages: [{ role: 'user', content }],
    })
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ level: parsed.level, summary: parsed.summary })
  } catch {
    return NextResponse.json(fallback(result))
  }
}
