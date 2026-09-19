  'use client'

  import { useEffect, useMemo, useState } from 'react'
  import {
    Activity, AlertTriangle, Bell, Building2, CalendarDays, ChevronDown, ChevronLeft,
    ChevronRight, CircleHelp, ClipboardList, FileText, LayoutDashboard, LogIn, Menu,
    Moon, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Stethoscope, UserRound,
    Users, X, Zap,
  } from 'lucide-react'

  type Patient = { name: string; id: string; age: string; district: string; date: string; status: 'Qizil' | 'Sariq' | 'Yashil' }
  type Examination = { id: string; patient: string; kind: string; date: string; result: 'Qizil' | 'Sariq' | 'Yashil'; summary: string }
  type Language = 'uz' | 'en' | 'ru'

  const copy = {
    uz: { overview: 'Umumiy ko‘rinish', patients: 'Bemorlar', exams: 'Tekshiruvlar', emergency: 'Favqulodda holatlar', settings: 'Sozlamalar', help: 'Yordam markazi', addPatient: 'Yangi bemor qo‘shish', addExam: 'Yangi tekshiruv', search: 'Bemor qidirish...', filter: 'Filtr', all: 'Barchasi', red: 'Qizil', yellow: 'Sariq', green: 'Yashil', clinicLogin: 'Klinikaga kirish', patientList: 'Bemorlar ro‘yxati', history: 'Tekshiruvlar tarixi', save: 'Saqlash', close: 'Yopish' },
    en: { overview: 'Overview', patients: 'Patients', exams: 'Examinations', emergency: 'Emergency cases', settings: 'Settings', help: 'Help center', addPatient: 'Add new patient', addExam: 'New examination', search: 'Search patients...', filter: 'Filter', all: 'All', red: 'Red', yellow: 'Yellow', green: 'Green', clinicLogin: 'Clinic login', patientList: 'Patient list', history: 'Examination history', save: 'Save', close: 'Close' },
    ru: { overview: 'Обзор', patients: 'Пациенты', exams: 'Обследования', emergency: 'Экстренные случаи', settings: 'Настройки', help: 'Центр помощи', addPatient: 'Добавить пациента', addExam: 'Новое обследование', search: 'Поиск пациентов...', filter: 'Фильтр', all: 'Все', red: 'Красный', yellow: 'Жёлтый', green: 'Зелёный', clinicLogin: 'Вход клиники', patientList: 'Список пациентов', history: 'История обследований', save: 'Сохранить', close: 'Закрыть' },
  } as const

  const patientHistory: Record<string, Examination[]> = {
    'MC-10248': [{ id: 'old-1', patient: 'Madina Karimova', kind: 'Qon tahlili', date: '12 sent, 2026', result: 'Sariq', summary: 'Gemoglobin past, qayta monitoring tavsiya etildi.' }, { id: 'old-2', patient: 'Madina Karimova', kind: 'UZI tekshiruvi', date: '04 sent, 2026', result: 'Yashil', summary: 'Homila rivojlanishi me’yorida.' }],
    'MC-10247': [{ id: 'old-3', patient: 'Zarina Yusupova', kind: 'Homila monitoringi', date: '10 sent, 2026', result: 'Yashil', summary: 'Ko‘rsatkichlar barqaror.' }],
  }

  function t(language: Language, key: keyof typeof copy.uz) { return copy[language][key] }

  const riskLabel = (language: Language, status: Patient['status']) => status === 'Qizil' ? t(language, 'red') : status === 'Sariq' ? t(language, 'yellow') : t(language, 'green')

  type PatientForm = { name: string; age: string; district: string; pregnancyWeek: string; phone: string }

  const patients: Patient[] = [
    { name: 'Madina Karimova', id: 'MC-10248', age: '28 yosh', district: 'Urganch sh.', date: 'Bugun, 09:42', status: 'Qizil' },
    { name: 'Zarina Yusupova', id: 'MC-10247', age: '31 yosh', district: 'Xiva t.', date: 'Bugun, 09:18', status: 'Sariq' },
    { name: 'Gulnora Abdullayeva', id: 'MC-10246', age: '24 yosh', district: 'Shovot t.', date: 'Kecha, 16:35', status: 'Yashil' },
    { name: 'Nilufar Sobirova', id: 'MC-10245', age: '35 yosh', district: 'Hazorasp t.', date: 'Kecha, 14:20', status: 'Sariq' },
    { name: 'Dildora Rahimova', id: 'MC-10244', age: '26 yosh', district: 'Gurlan t.', date: '18 sent, 11:08', status: 'Yashil' },
  ]

  const navItems = [
    { label: 'Umumiy ko‘rinish', icon: LayoutDashboard },
    { label: 'Bemorlar', icon: Users },
    { label: 'Tekshiruvlar', icon: ClipboardList },
    { label: 'Favqulodda holatlar', icon: AlertTriangle, count: 3 },
  ]

  const managementItems = [
    { label: 'Sozlamalar', icon: Settings },
    { label: 'Yordam markazi', icon: CircleHelp },
  ]

  export default function Page() {
    const [active, setActive] = useState('Umumiy ko‘rinish')
    const [clinic, setClinic] = useState('OvaBMU klinikasi')
    const [language, setLanguage] = useState<Language>('uz')
    const [patientRows, setPatientRows] = useState<Patient[]>(patients)
    const [riskFilter, setRiskFilter] = useState<'all' | Patient['status']>('all')
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [selectedAlert, setSelectedAlert] = useState<{ title: string; message: string } | null>(null)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [authOpen, setAuthOpen] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const [search, setSearch] = useState('')
    const [notice, setNotice] = useState('')
    const [patientModal, setPatientModal] = useState(false)
    const [patientTypeForm, setPatientTypeForm] = useState('Homilador ayol')
    const [examModal, setExamModal] = useState(false)
    const [examinations, setExaminations] = useState<Examination[]>([])
    const [examBusy, setExamBusy] = useState(false)
    const [notifications, setNotifications] = useState<string[]>([])
    const [cursor, setCursor] = useState({ x: -80, y: -80 })

    useEffect(() => {
      const handlePointerMove = (event: PointerEvent) => setCursor({ x: event.clientX, y: event.clientY })
      window.addEventListener('pointermove', handlePointerMove)
      return () => window.removeEventListener('pointermove', handlePointerMove)
    }, [])

    const filteredPatients = useMemo(() => patientRows.filter((p) => (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())) && (riskFilter === 'all' || p.status === riskFilter)), [patientRows, search, riskFilter])
    const emergencyAlerts = useMemo(() => [
      'Madina Karimova — QIZIL holat: Gemoglobin past, darhol shifokor ko‘rigi kerak.',
      'Zarina Yusupova — SARIQ holat: qayta monitoring va nazorat tavsiya etildi.',
      'OvaBMU markazi — navbatchi mutaxassislar uchun 24/7 kuzatuv eslatmasi.',
      ...notifications,
    ].slice(0, 20), [notifications])
    const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }

    async function addPatient(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setExamBusy(true)
      const data = new FormData(e.currentTarget)
      const name = String(data.get('name') || '').trim()
      if (!name) { setExamBusy(false); return }
      const image = data.get('image') as File | null
      let imageData = ''
      if (image && image.size > 0) {
        if (!image.type.startsWith('image/')) { showNotice('Faqat rasm faylini yuklang'); setExamBusy(false); return }
        if (image.size > 10 * 1024 * 1024) { showNotice('Rasm hajmi 10 MB dan oshmasligi kerak'); setExamBusy(false); return }
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = reject
          reader.readAsDataURL(image)
        })
      }
      const patientType = String(data.get('patientType') || 'Bemor')
      const ageValue = String(data.get('age') || '').trim()
      const ageUnit = patientType === 'Chaqaloq' ? String(data.get('ageUnit') || 'oylik') : 'yosh'
      const newPatient: Patient = { name, id: `MC-${String(10249 + patientRows.length).padStart(5, '0')}`, age: `${ageValue} ${ageUnit}`, district: String(data.get('district') || ''), date: imageData ? 'AI tahlil qilinmoqda' : 'Hozir', status: 'Yashil' }
      setPatientRows((current) => [newPatient, ...current])
      setPatientModal(false)
      if (imageData) {
        try {
          const response = await fetch('/api/analyze-examination', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient: name, kind: patientType, result: '', image: imageData }) })
          const analysis = await response.json()
          const item: Examination = { id: `EX-${Date.now()}`, patient: name, kind: patientType, date: 'Hozir', result: analysis.level, summary: analysis.summary }
          setExaminations((current) => [item, ...current])
          setPatientRows((current) => current.map((p) => p.id === newPatient.id ? { ...p, date: 'Hozir', status: analysis.level } : p))
          if (analysis.level === 'Qizil') setNotifications((current) => [`${name} — QIZIL holat: ${analysis.summary}`, ...current])
          showNotice(analysis.level === 'Qizil' ? 'Qizil holat aniqlandi: bildirishnoma yuborildi' : 'Bemor saqlandi va tahlil AI tomonidan baholandi')
        } catch { showNotice('Bemor saqlandi, ammo rasm tahlilida xatolik yuz berdi') }
      } else showNotice(`${name} bemorlar ro‘yxatiga qo‘shildi`)
      setExamBusy(false)
    }

    async function addExamination(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setExamBusy(true)
      const data = new FormData(e.currentTarget)
      const patient = String(data.get('patient') || '')
      const kind = String(data.get('kind') || 'Laboratoriya tahlili')
      const text = String(data.get('result') || '')
      const image = data.get('image') as File | null
      let imageData = ''
      if (image && image.size > 0) {
        if (!image.type.startsWith('image/')) { showNotice('Faqat rasm faylini yuklang'); setExamBusy(false); return }
        if (image.size > 10 * 1024 * 1024) { showNotice('Rasm hajmi 10 MB dan oshmasligi kerak'); setExamBusy(false); return }
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = reject
          reader.readAsDataURL(image)
        })
      }
      if (!text && !imageData) { showNotice('Tahlil natijasi rasmini yuklang'); setExamBusy(false); return }
      try {
        const response = await fetch('/api/analyze-examination', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient, kind, result: text, image: imageData }) })
        const analysis = await response.json()
        const item: Examination = { id: `EX-${Date.now()}`, patient, kind, date: 'Hozir', result: analysis.level, summary: analysis.summary }
        setExaminations((current) => [item, ...current])
        const matched = patientRows.find((p) => p.name.toLowerCase() === patient.toLowerCase())
        if (matched) {
          setPatientRows((current) => current.map((p) => p.id === matched.id ? { ...p, date: 'Hozir', status: analysis.level } : p))
          setSelectedPatient((current) => current?.id === matched.id ? { ...current, date: 'Hozir', status: analysis.level } : current)
        }
        if (analysis.level === 'Qizil') {
          const alert = `${patient} — QIZIL holat: ${analysis.summary}`
          setNotifications((current) => [alert, ...current])
          showNotice('Qizil holat aniqlandi: klinika va OvaBMU markaziga bildirishnoma yuborildi')
        } else showNotice('Tahlil AI tomonidan baholandi')
        setExamModal(false)
      } catch { showNotice('Tahlilni baholashda xatolik yuz berdi') } finally { setExamBusy(false) }
    }

    function submitAuth(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      const name = String(data.get('clinic') || '').trim()
      if (name) setClinic(name)
      setAuthOpen(false)
      showNotice(authMode === 'register' ? 'Klinika muvaffaqiyatli ro‘yxatdan o‘tdi' : 'Tizimga muvaffaqiyatli kirdingiz')
    }

    return (
      <div className="app-shell">
        <div className="medical-cursor" style={{ left: cursor.x, top: cursor.y }} aria-hidden="true"><span>+</span><i></i><b></b></div>
        <aside className="sidebar">
          <div className="brand"><img className="brand-logo" src="/manocare-logo.png" alt="ManoCare AI logotipi" /><div><strong>ManoCare Ai</strong><span>Perinatal xavf monitoringi</span></div></div>
          <div className="region"><span>HUDUD</span><strong>Xorazm viloyati</strong></div>
          <nav>
            <span className="nav-caption">ASOSIY</span>
            {navItems.map(({ label, icon: Icon, count }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={18} /><span>{label === 'Umumiy ko‘rinish' ? t(language, 'overview') : label === 'Bemorlar' ? t(language, 'patients') : label === 'Tekshiruvlar' ? t(language, 'exams') : label === 'Favqulodda holatlar' ? t(language, 'emergency') : label === 'Sozlamalar' ? t(language, 'settings') : t(language, 'help')}</span>{count && <b>{count}</b>}</button>)}
            <span className="nav-caption space">BOSHQARUV</span>
            {managementItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={18} /><span>{label}</span></button>)}
          </nav>
          <div className="support-card"><div className="support-icon"><ShieldCheck size={19} /></div><strong>OvaBMU markazi</strong><span>24/7 mutaxassis yordami</span><button onClick={() => showNotice('Mutaxassis siz bilan tez orada bog‘lanadi')}>Markaz bilan bog‘lanish <ChevronRight size={14} /></button></div>
          <div className="profile"><div className="avatar">OK</div><div><strong>{clinic}</strong><span>Klinika administratori</span></div><button className="profile-more" onClick={() => setProfileMenuOpen(!profileMenuOpen)} aria-label="Profil menyusi"><MoreHorizontal size={19} /></button>{profileMenuOpen && <div className="profile-menu"><button onClick={() => { setActive('Sozlamalar'); setProfileMenuOpen(false) }}>Klinika profili</button><button onClick={() => { setAuthOpen(true); setAuthMode('login'); setProfileMenuOpen(false) }}>Chiqish</button></div>}</div>
        </aside>

        <main className="main-content">
          <header className="topbar"><button className="mobile-menu"><Menu size={21} /></button><div className="crumb"><img className="topbar-logo" src="/manocare-logo.png" alt="ManoCare AI" /><span>ManoCare Ai</span><ChevronRight size={15} /><strong>{active}</strong><span className="live-dot">● Jonli monitoring</span></div><div className="top-actions"><button aria-label="Bildirishnomalar" className="icon-button" onClick={() => setActive('Favqulodda holatlar')}><Bell size={19} /><i>{emergencyAlerts.length}</i></button><button className="icon-button" onClick={() => document.documentElement.classList.toggle('dark')} aria-label="Rejim"><Moon size={18} /></button><div className="language-picker"><button className="lang" onClick={() => setProfileMenuOpen(profileMenuOpen ? false : true)}>{language.toUpperCase()} <ChevronDown size={14} /></button>{profileMenuOpen && <div className="language-menu">{(['uz','en','ru'] as Language[]).map((item) => <button key={item} onClick={() => { setLanguage(item); setProfileMenuOpen(false) }}>{item === 'uz' ? 'O‘zbekcha' : item === 'en' ? 'English' : 'Русский'}</button>)}</div>}</div><button className="clinic-login" onClick={() => { setAuthMode('login'); setAuthOpen(true) }}><LogIn size={16} /> Klinikaga kirish</button></div></header>

          <div className="page-wrap">
            <div className="welcome"><div><div className="date"><CalendarDays size={15} /> 18 sentyabr 2026, Juma</div><h1>{active === 'Umumiy ko‘rinish' ? `Assalomu alaykum, ${clinic}` : active}</h1><p>{active === 'Bemorlar' ? 'Klinikangizdagi barcha bemorlarni boshqaring va kuzating.' : active === 'Tekshiruvlar' ? 'Bemorlar tekshiruvlarini yarating va natijalarni kuzating.' : 'Klinikangizdagi perinatal salomatlik holati haqida umumiy ma’lumot.'}</p></div>{(active === 'Umumiy ko‘rinish' || active === 'Bemorlar') && <button className="primary-btn" onClick={() => setPatientModal(true)}><Plus size={18} /> Yangi bemor qo‘shish</button>}</div>

            {active === 'Umumiy ko‘rinish' ? <>
              <section className="stats-grid">{[['Jami bemorlar','1,248','+8.4% bu oy','blue'],['Yuqori xavf','86','12 ta yangi','red'],['O‘rtacha xavf','214','−4.2% bu oy','yellow'],['Normal holat','948','76% jami','green']].map(([title, value, sub, tone]) => <div className="stat-card" key={title}><div className={`stat-icon ${tone}`}><Users size={18} /></div><span>{title}</span><strong>{value}</strong><small className={tone === 'red' ? 'danger-text' : ''}>{sub}</small></div>)}<div className="stat-card alert-stat"><div className="stat-icon red"><Zap size={18} /></div><span>Faol ogohlantirishlar</span><strong>3</strong><small>Tezkor ko‘rib chiqing <ChevronRight size={14} /></small></div></section>
              <div className="overview-grid"><section className="card risk-card"><div className="card-head"><div><h2>Xavf zonalari</h2><p>Bugungi holat bo‘yicha taqsimot</p></div><button className="select-btn">Oxirgi 30 kun <ChevronDown size={14} /></button></div><div className="risk-content"><div className="donut"><div><strong>1,248</strong><span>jami bemor</span></div></div><div className="legend">{[['Qizil zona','Darhol aralashuv kerak','86','6.9%','red'],['Sariq zona','Yaqin monitoring kerak','214','17.1%','yellow'],['Yashil zona','Ko‘rsatkichlar norma','948','76.0%','green']].map(([name, desc, value, percent, tone]) => <div className="legend-row" key={name}><i className={tone}></i><div><strong>{name}</strong><span>{desc}</span></div><b>{value}<em>{percent}</em></b></div>)}</div></div></section><section className="card district-card"><div className="card-head"><div><h2>Tumanlar kesimida</h2><p>Xavf darajasi bo‘yicha taqsimot</p></div><button className="dots"><MoreHorizontal size={18} /></button></div>{[['Urganch sh.','32'],['Xiva t.','21'],['Shovot t.','16'],['Hazorasp t.','14'],['Gurlan t.','10']].map(([name, num], i) => <div className="bar-row" key={name}><span>{name}</span><div><i style={{width: `${55 + i * 7}%`}}></i></div><b>{num}</b></div>)}<div className="district-foot">Xorazm viloyati · 13 tuman va shahar <span>Yangilandi: 2 daqiqa oldin</span></div></section></div>
            </> : active === 'Sozlamalar' ? <SettingsPanel clinic={clinic} showNotice={showNotice} /> : active === 'Yordam markazi' ? <HelpPanel showNotice={showNotice} /> : <section className="card patient-page"><div className="card-head"><div><h2>{active}</h2><p>{active === 'Favqulodda holatlar' ? 'Zudlik bilan e’tibor talab qiladigan holatlar.' : active === 'Tekshiruvlar' ? 'Har bir bemor uchun alohida tekshiruvlar tarixi.' : 'Bemorlar ma’lumotlari va holati.'}</p></div>{active === 'Tekshiruvlar' && <button className="primary-btn small" onClick={() => setExamModal(true)}><Plus size={16}/> Yangi tekshiruv</button>}</div>{active === 'Favqulodda holatlar' ? <div className="alert-list">{emergencyAlerts.map((alert, index) => { const separator = alert.indexOf(' — '); const title = separator >= 0 ? alert.slice(0, separator) : 'OvaBMU markazi'; const message = separator >= 0 ? alert.slice(separator + 3) : alert; return <div className="emergency-row" key={`${alert}-${index}`}><div className="alert-icon"><AlertTriangle size={18}/></div><div><strong>{title}</strong><p>{message}</p><span>Hozir · Klinikaga va OvaBMU markaziga yuborildi</span></div><button className="text-btn" onClick={() => { const patient = patientRows.find((item) => title.startsWith(item.name)); if (patient) { setSelectedAlert({ title, message }); setSelectedPatient(patient) } else showNotice(message) }}>Ko‘rish <ChevronRight size={15}/></button></div>})}</div> : active === 'Tekshiruvlar' ? <div className="exam-list">{examinations.length === 0 ? <div className="empty-state"><ClipboardList size={34}/><h3>Tekshiruvlar ro‘yxati</h3><p>Yangi tekshiruv qo‘shish uchun yuqoridagi tugmani bosing.</p></div> : examinations.map((exam) => <div className="exam-row" key={exam.id}><div><strong>{exam.patient}</strong><span>{exam.kind} · {exam.date}</span><p>{exam.summary}</p></div><span className={`status ${exam.result.toLowerCase()}`}><i></i>{exam.result} zona</span></div>)}</div> : <PatientTable patients={filteredPatients} search={search} setSearch={setSearch} riskFilter={riskFilter} setRiskFilter={setRiskFilter} onSelect={setSelectedPatient} language={language} />}</section>}

            {active === 'Umumiy ko‘rinish' && <section className="card patient-card"><div className="card-head"><div><h2>Bemorlar ro‘yxati</h2><p>So‘nggi yangilangan bemorlar</p></div><button className="text-btn" onClick={() => setActive('Bemorlar')}>Barchasini ko‘rish <ChevronRight size={16}/></button></div><PatientTable patients={filteredPatients} search={search} setSearch={setSearch} riskFilter={riskFilter} setRiskFilter={setRiskFilter} onSelect={setSelectedPatient} language={language} /></section>}
          </div>
        </main>
        {notifications.length > 0 && <div className="notification-panel"><strong><Bell size={16}/> Ogohlantirishlar</strong>{notifications.slice(0, 3).map((item, index) => <p key={`${item}-${index}`}><AlertTriangle size={15}/>{item}</p>)}</div>}
        {notice && <div className="toast"><ShieldCheck size={17}/>{notice}</div>}
        {patientModal && <div className="modal-backdrop" onMouseDown={() => setPatientModal(false)}><div className="auth-modal workflow-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={() => setPatientModal(false)}><X size={19}/></button><div className="modal-logo"><UserRound size={21}/></div><h2>Yangi bemor qo‘shish</h2><p>Shaxsiy ma’lumotlarni kiriting va tahlil natijasini rasmda yuklang.</p><form onSubmit={addPatient}><label>Bemor turi<select name="patientType" value={patientTypeForm} onChange={(e) => setPatientTypeForm(e.target.value)}><option>Homilador ayol</option><option>Chaqaloq</option><option>Boshqa bemor</option></select></label><label>F.I.Sh.<input name="name" required placeholder="Masalan: Madina Karimova" /></label><div className="form-grid"><label>{patientTypeForm === 'Chaqaloq' ? 'Chaqaloq yoshi' : 'Yoshi'}<input name="age" required type={patientTypeForm === 'Chaqaloq' ? 'text' : 'number'} inputMode={patientTypeForm === 'Chaqaloq' ? 'text' : 'numeric'} min={patientTypeForm === 'Chaqaloq' ? undefined : '0'} placeholder={patientTypeForm === 'Chaqaloq' ? 'Masalan: 2 oy yoki 3 hafta' : '28'} /></label><label>Tuman/shahar<input name="district" required list="districts" placeholder="Tuman yoki shaharni tanlang" /><datalist id="districts"><option value="Urganch sh." /><option value="Xiva t." /><option value="Shovot t." /><option value="Hazorasp t." /><option value="Gurlan t." /><option value="Yangibozor t." /><option value="Qo‘shko‘pir t." /><option value="Xonqa t." /><option value="Bog‘ot t." /><option value="Yangiariq t." /><option value="Tuproqqal’a t." /></datalist></label></div>{patientTypeForm === 'Chaqaloq' && <label className="conditional-age">Chaqaloq yoshi birligi<select name="ageUnit" defaultValue="oylik"><option value="haftalik">Haftalik</option><option value="oylik">Oylik</option></select></label>}<label>Homiladorlik haftasi<input name="pregnancyWeek" inputMode="numeric" pattern="[0-9]*" placeholder="Homilador bo‘lmasa bo‘sh qoldiring" /></label><label>Telefon raqami<input name="phone" required type="tel" placeholder="+998 90 000 00 00" /></label><label className="upload-label">Tahlil natijasi rasmi<input className="file-input" name="image" type="file" accept="image/jpeg,image/png,image/webp" required /><span className="upload-box"><FileText size={24}/><strong>Rasmni tanlang yoki shu yerga tashlang</strong><small>JPG, PNG yoki WEBP · maksimal 10 MB</small></span></label><small className="form-hint">Tahlil natijasi rasmda bo‘lishi shart. AI rasmni o‘qib, xavf darajasini aniqlaydi.</small><button className="primary-btn submit" type="submit" disabled={examBusy}>{examBusy ? 'AI tahlil qilmoqda...' : 'Bemorni saqlash va AI tahlil qilish'} <ChevronRight size={17}/></button></form></div></div>}
        {examModal && <div className="modal-backdrop" onMouseDown={() => setExamModal(false)}><div className="auth-modal workflow-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={() => setExamModal(false)}><X size={19}/></button><div className="modal-logo"><ClipboardList size={21}/></div><h2>Yangi tekshiruv</h2><p>Tahlil ma’lumotini yuboring. AI xavf darajasini belgilaydi.</p><form onSubmit={addExamination}><label>Bemor F.I.Sh.<input name="patient" required placeholder="Bemorni tanlang yoki kiriting" /></label><label>Tekshiruv turi<select name="kind" defaultValue="Qon tahlili"><option>Qon tahlili</option><option>UZI tekshiruvi</option><option>Homila monitoringi</option><option>Chaqaloq holati</option></select></label><label>Tahlil natijasi rasmi<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label><small className="form-hint">Laboratoriya, UZI, homiladorlik yoki chaqaloq natijasini rasm ko‘rinishida yuklang. Maksimal 10 MB.</small><label>Qo‘shimcha izoh (ixtiyoriy)<textarea name="result" placeholder="Masalan: shikoyatlar yoki shifokor izohi..." /></label><button className="primary-btn submit" type="submit" disabled={examBusy}>{examBusy ? 'AI tahlil qilmoqda...' : 'Rasmni AI bilan tahlil qilish'} <ChevronRight size={17}/></button></form></div></div>}
        {selectedPatient && <div className="modal-backdrop" onMouseDown={() => setSelectedPatient(null)}><div className="auth-modal workflow-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={() => setSelectedPatient(null)}><X size={19}/></button><div className="modal-logo"><Activity size={21}/></div><h2>{selectedPatient.name}</h2><p>{selectedPatient.id} · {selectedPatient.district} · {selectedPatient.status} zona</p>{selectedAlert && <div className={`alert-detail ${selectedPatient.status.toLowerCase()}`}><strong>{selectedAlert.title} · {selectedPatient.status.toUpperCase()} holat</strong><p>{selectedAlert.message}</p><span>Klinika va OvaBMU markaziga yuborilgan</span></div>}<div className="history-chart">{[58, 74, 48, 88, 66, selectedPatient.status === 'Qizil' ? 96 : 52].map((height, index) => <i key={index} style={{height: `${height}%`}} title={`Tekshiruv ${index + 1}`} />)}</div><h3>{t(language, 'history')}</h3><div className="exam-list">{[...(patientHistory[selectedPatient.id] || []), ...examinations.filter((exam) => exam.patient.toLowerCase() === selectedPatient.name.toLowerCase())].map((exam) => <div className="exam-row" key={exam.id}><div><strong>{exam.kind}</strong><span>{exam.date}</span><p>{exam.summary}</p></div><span className={`status ${exam.result.toLowerCase()}`}><i />{riskLabel(language, exam.result)} zona</span></div>)}<button className="primary-btn submit" onClick={() => { setSelectedPatient(null); setActive('Tekshiruvlar'); setExamModal(true) }}><Plus size={16} /> {t(language, 'addExam')}</button></div></div></div>}
        {authOpen && <div className="modal-backdrop" onMouseDown={() => setAuthOpen(false)}><div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={() => setAuthOpen(false)}><X size={19}/></button><div className="modal-logo"><Activity size={21}/></div><h2>{authMode === 'login' ? 'Klinika tizimiga kirish' : 'Klinikani ro‘yxatdan o‘tkazish'}</h2><p>{authMode === 'login' ? 'Klinika hisobingiz orqali davom eting.' : 'Klinikangiz ma’lumotlarini kiriting.'}</p><form onSubmit={submitAuth}>{authMode === 'register' && <label>Klinika nomi<input name="clinic" required placeholder="Masalan: OvaBMU klinikasi" /></label>}<label>Email manzil<input name="email" type="email" required placeholder="admin@klinika.uz" /></label><label>Parol<input name="password" type="password" required minLength={6} placeholder="••••••••" /></label><button className="primary-btn submit" type="submit">{authMode === 'login' ? 'Kirish' : 'Ro‘yxatdan o‘tish'} <ChevronRight size={17}/></button></form><button className="switch-auth" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Klinikani ro‘yxatdan o‘tkazish' : 'Hisobim bor, kirish'}</button></div></div>}
      </div>
    )
  }

  function SettingsPanel({ clinic, showNotice }: { clinic: string; showNotice: (message: string) => void }) {
    return <section className="card patient-page"><div className="card-head"><div><h2>Klinika sozlamalari</h2><p>Profil va ish jarayonlarini boshqaring.</p></div><button className="primary-btn small" onClick={() => showNotice('Sozlamalar saqlandi')}><ShieldCheck size={16}/> Saqlash</button></div><div className="settings-grid"><label>Klinika nomi<input defaultValue={clinic} /></label><label>Hudud<input defaultValue="Xorazm viloyati" /></label><label>Administrator email<input type="email" defaultValue="admin@klinika.uz" /></label></div></section>
  }

  function HelpPanel({ showNotice }: { showNotice: (message: string) => void }) {
    return <section className="card patient-page"><div className="card-head"><div><h2>Yordam markazi</h2><p>ManoCare Ai bo‘yicha yordam oling.</p></div></div><div className="help-options"><button onClick={() => showNotice('Qo‘llanma ochildi')}><FileText size={20}/><strong>Foydalanish qo‘llanmasi</strong><span>Tizim bo‘limlari haqida bilib oling</span></button><button onClick={() => showNotice('Mutaxassis siz bilan bog‘lanadi')}><CircleHelp size={20}/><strong>Mutaxassis bilan bog‘lanish</strong><span>24/7 yordam so‘rovini yuboring</span></button></div></section>
  }

  function PatientTable({ patients, search, setSearch, riskFilter, setRiskFilter, onSelect, language }: { patients: Patient[]; search: string; setSearch: (value: string) => void; riskFilter: 'all' | Patient['status']; setRiskFilter: (value: 'all' | Patient['status']) => void; onSelect: (patient: Patient) => void; language: Language }) { return <><div className="table-tools"><div className="search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(language, 'search')} /></div><select className="filter-btn" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as 'all' | Patient['status'])}><option value="all">{t(language, 'all')}</option><option value="Qizil">{t(language, 'red')}</option><option value="Sariq">{t(language, 'yellow')}</option><option value="Yashil">{t(language, 'green')}</option></select></div><div className="table-wrap"><table><thead><tr><th>BEMOR</th><th>TURI</th><th>HUDUD</th><th>SO‘NGGI TEKSHIRUV</th><th>HOLAT</th></tr></thead><tbody>{patients.map((p) => <tr key={p.id} onClick={() => onSelect(p)} className="clickable-row"><td><div className="patient-name"><div className="patient-avatar">{p.name.split(' ').map(n => n[0]).join('')}</div><div><strong>{p.name}</strong><span>{p.id}</span></div></div></td><td>{p.age}</td><td>{p.district}</td><td>{p.date}</td><td><span className={`status ${p.status.toLowerCase()}`}><i></i>{riskLabel(language, p.status)} zona</span></td></tr>)}</tbody></table></div></> }
