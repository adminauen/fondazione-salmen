(() => {
  const button = document.getElementById('print');
  if (!button) return;

  const value = id => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };

  const pdfEncode = input => {
    const map = {
      'à':'\\340','á':'\\341','â':'\\342','ä':'\\344','è':'\\350','é':'\\351','ê':'\\352','ë':'\\353',
      'ì':'\\354','í':'\\355','î':'\\356','ï':'\\357','ò':'\\362','ó':'\\363','ô':'\\364','ö':'\\366',
      'ù':'\\371','ú':'\\372','û':'\\373','ü':'\\374','Ä':'\\304','Ö':'\\326','Ü':'\\334','ß':'\\337',
      'À':'\\300','È':'\\310','É':'\\311','Ì':'\\314','Ò':'\\322','Ù':'\\331','’':'\\222','“':'\\223',
      '”':'\\224','–':'\\226','—':'\\227','€':'\\200'
    };
    let out = '';
    for (const ch of String(input ?? '')) {
      if (ch === '\\') out += '\\\\';
      else if (ch === '(') out += '\\(';
      else if (ch === ')') out += '\\)';
      else if (ch === '\n' || ch === '\r') out += '\\r';
      else {
        const code = ch.charCodeAt(0);
        out += code >= 32 && code <= 126 ? ch : (map[ch] || '?');
      }
    }
    return out;
  };

  const makePdf = (lang, values) => {
    const it = lang === 'it';
    const pageRefs = {1:6, 2:8, 3:10};
    const defs = [
      [1, it?'richiesta':'gesuch', [45,590,550,635], 1, values.request],
      [1, it?'nome':'name', [45,500,290,530], 0, values.name],
      [1, it?'domicilio':'wohnort', [305,500,550,530], 0, values.address],
      [1, it?'eta':'alter', [45,442,290,472], 0, values.age],
      [1, it?'situazione_personale':'persoenliche_situation', [305,442,550,472], 0, values.personal],
      [1, it?'abitazione':'wohnen', [45,384,290,414], 0, values.housing],
      [1, it?'rete_famigliare':'familiaeres_umfeld', [305,384,550,414], 0, values.family],
      [2, it?'situazione_partenza':'ausgangslage', [45,615,550,700], 1, values.starting],
      [2, it?'aiuto_proposto':'hilfe', [45,490,550,575], 1, values.help],
      [2, it?'situazione_finanziaria':'finanzielle_situation', [45,365,550,450], 1, values.finances],
      [2, it?'richiesta_fondazione':'gesuch_stiftung', [45,240,550,325], 1, values.foundation],
      [2, it?'luogo_data':'ort_datum', [45,155,290,185], 0, values.placeDate],
      [2, it?'firma':'unterschrift', [305,155,550,185], 0, ''],
      [3, it?'decisione':'entscheid', [45,650,550,682], 0, ''],
      [3, it?'motivazione':'begruendung', [45,430,550,610], 1, ''],
      [3, it?'decisione_numero':'entscheid_nummer', [45,350,290,380], 0, ''],
      [3, it?'seduta':'sitzung', [305,350,550,380], 0, ''],
      [3, it?'consiglio_luogo_data':'rat_ort_datum', [45,270,290,300], 0, ''],
      [3, it?'consiglio_firma':'rat_unterschrift', [305,270,550,300], 0, '']
    ];
    const fields = defs.map((d, i) => ({p:d[0], n:d[1], r:d[2], multi:!!d[3], v:d[4] || '', id:12+i}));
    const refs = p => fields.filter(f => f.p === p).map(f => f.id + ' 0 R').join(' ');
    const t = (x,y,size,s,b=false,color='0.09 0.25 0.26') =>
      'BT /' + (b?'F2':'F1') + ' ' + size + ' Tf ' + color + ' rg 1 0 0 1 ' + x + ' ' + y +
      ' Tm (' + pdfEncode(s) + ') Tj ET\n';
    const ln = (x1,y1,x2,y2,w=.5,c='0.82 0.84 0.82') =>
      c + ' RG ' + w + ' w ' + x1 + ' ' + y1 + ' m ' + x2 + ' ' + y2 + ' l S\n';
    const bx = (x,y,w,h) => '0.92 0.94 0.91 rg ' + x + ' ' + y + ' ' + w + ' ' + h + ' re f\n';
    const foot = () => ln(45,45,550,45) +
      t(45,29,6.5,'Fondazione Hubert e Gisela Salmen · Via San Michele 20 · 6612 Ascona · info@fondazionesalmen.ch',false,'0.40 0.43 0.42');

    let c1='', c2='', c3='';
    if (it) {
      c1 += t(45,785,22,'Richiesta di sostegno',true) + t(45,764,9,'Fondazione Hubert e Gisela Salmen',true,'0.18 0.23 0.22');
      c1 += t(45,747,8.5,'Formulario per persone anziane bisognose nel Locarnese e nelle valli.',false,'0.25 0.30 0.29');
      c1 += bx(45,708,505,26) + t(55,717,8.5,'Inviare il formulario compilato e firmato a: info@fondazionesalmen.ch',true,'0.18 0.30 0.25');
      c1 += t(45,666,10,'1. Richiesta / segnalazione',true) + t(45,646,7.5,'Descrivete brevemente il motivo della richiesta',false,'0.25 0.30 0.29');
      c1 += t(45,558,10,'2. Persona interessata',true) + t(45,536,7.5,'Nome e cognome') + t(305,536,7.5,'Domicilio');
      c1 += t(45,478,7.5,'Età') + t(305,478,7.5,'Situazione personale') + t(45,420,7.5,'Abita in casa propria / affitto') + t(305,420,7.5,'Rete famigliare');
      c2 += t(45,785,18,'3. Situazione e sostegno richiesto',true) + t(45,708,7.5,'Situazione di partenza') + t(45,583,7.5,"Valutazione dell'aiuto da proporre");
      c2 += t(45,458,7.5,'Valutazione della situazione finanziaria') + t(45,333,7.5,'Richiesta alla Fondazione') + t(45,192,7.5,'Luogo e data') + t(305,192,7.5,'Firma');
      c2 += t(45,127,7,"Allegare, se disponibili, documenti utili alla valutazione della richiesta. I dati saranno trattati esclusivamente per l'esame della domanda.",false,'0.35 0.38 0.37');
      c3 += t(45,785,18,'Riservato al Consiglio di Fondazione',true) + t(45,690,7.5,'Decisione: Approvata / Respinta');
      c3 += t(45,618,7.5,'Motivazione / indicazioni / tipo di aiuto concesso') + t(45,387,7.5,'Decisione N.') + t(305,387,7.5,'Seduta') + t(45,307,7.5,'Luogo e data') + t(305,307,7.5,'Firma');
    } else {
      c1 += t(45,785,22,'Unterstützungsgesuch',true) + t(45,764,9,'Fondazione Hubert e Gisela Salmen',true,'0.18 0.23 0.22');
      c1 += t(45,747,8.5,'Formular für bedürftige ältere Menschen in der Region Locarno und ihren Tälern.',false,'0.25 0.30 0.29');
      c1 += bx(45,708,505,26) + t(55,717,8.5,'Ausgefülltes und unterschriebenes Formular senden an: info@fondazionesalmen.ch',true,'0.18 0.30 0.25');
      c1 += t(45,666,10,'1. Gesuch / Meldung',true) + t(45,646,7.5,'Beschreiben Sie kurz den Grund des Gesuchs',false,'0.25 0.30 0.29');
      c1 += t(45,558,10,'2. Betroffene Person',true) + t(45,536,7.5,'Vor- und Nachname') + t(305,536,7.5,'Wohnort');
      c1 += t(45,478,7.5,'Alter') + t(305,478,7.5,'Persönliche Situation') + t(45,420,7.5,'Wohneigentum / Miete') + t(305,420,7.5,'Familiäres Umfeld');
      c2 += t(45,785,18,'3. Ausgangslage und beantragte Unterstützung',true) + t(45,708,7.5,'Ausgangslage') + t(45,583,7.5,'Einschätzung der vorgeschlagenen Hilfe');
      c2 += t(45,458,7.5,'Einschätzung der finanziellen Situation') + t(45,333,7.5,'Gesuch an die Stiftung') + t(45,192,7.5,'Ort und Datum') + t(305,192,7.5,'Unterschrift');
      c2 += t(45,127,7,'Falls vorhanden, bitte Unterlagen beilegen, die für die Beurteilung des Gesuchs hilfreich sind. Die Angaben werden nur zur Prüfung des Gesuchs verwendet.',false,'0.35 0.38 0.37');
      c3 += t(45,785,18,'Vom Stiftungsrat auszufüllen',true) + t(45,690,7.5,'Entscheid: Genehmigt / Abgelehnt');
      c3 += t(45,618,7.5,'Begründung / Hinweise / Art der gewährten Hilfe') + t(45,387,7.5,'Entscheid Nr.') + t(305,387,7.5,'Sitzung') + t(45,307,7.5,'Ort und Datum') + t(305,307,7.5,'Unterschrift');
    }
    c1 += foot(); c2 += foot(); c3 += foot();

    const o = {};
    o[1] = '<< /Type /Catalog /Pages 2 0 R /AcroForm 3 0 R >>';
    o[2] = '<< /Type /Pages /Count 3 /Kids [6 0 R 8 0 R 10 0 R] >>';
    o[3] = '<< /Fields [' + fields.map(f => f.id + ' 0 R').join(' ') + '] /NeedAppearances true /DA (/Helv 10 Tf 0 g) /DR << /Font << /Helv 4 0 R /HelvB 5 0 R >> >> >>';
    o[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    o[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    o[6] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 7 0 R /Annots [' + refs(1) + '] >>';
    o[7] = '<< /Length ' + c1.length + ' >>\nstream\n' + c1 + 'endstream';
    o[8] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 9 0 R /Annots [' + refs(2) + '] >>';
    o[9] = '<< /Length ' + c2.length + ' >>\nstream\n' + c2 + 'endstream';
    o[10] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 11 0 R /Annots [' + refs(3) + '] >>';
    o[11] = '<< /Length ' + c3.length + ' >>\nstream\n' + c3 + 'endstream';

    fields.forEach(f => {
      o[f.id] = '<< /Type /Annot /Subtype /Widget /FT /Tx /T (' + f.n + ') /V (' + pdfEncode(f.v) + ') /DV (' + pdfEncode(f.v) +
        ') /Rect [' + f.r.join(' ') + '] /P ' + pageRefs[f.p] + ' 0 R /F 4 /Ff ' + (f.multi ? 4096 : 0) +
        ' /DA (/Helv 10 Tf 0 g) /MK << /BC [0.60 0.67 0.64] /BG [1 1 1] >> /BS << /W 0.8 /S /S >> >>';
    });

    const max = Math.max(...Object.keys(o).map(Number));
    let pdf = '%PDF-1.4\n%ASCII\n';
    const offsets = [0];
    for (let i = 1; i <= max; i++) {
      offsets[i] = pdf.length;
      pdf += i + ' 0 obj\n' + o[i] + '\nendobj\n';
    }
    const xref = pdf.length;
    pdf += 'xref\n0 ' + (max + 1) + '\n0000000000 65535 f \n';
    for (let i = 1; i <= max; i++) pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    pdf += 'trailer\n<< /Size ' + (max + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
    return pdf;
  };

  button.addEventListener('click', () => {
    const lang = document.documentElement.lang === 'de' ? 'de' : 'it';
    const values = {
      request: value('segnalazione'),
      name: value('nome'),
      address: value('domicilio'),
      age: value('eta'),
      personal: value('situazione'),
      housing: value('abitazione'),
      family: value('famiglia'),
      starting: value('partenza'),
      help: value('aiuto'),
      finances: value('finanze'),
      foundation: value('richiesta'),
      placeDate: value('data')
    };
    const pdf = makePdf(lang, values);
    const blob = new Blob([pdf], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lang === 'de' ? 'unterstuetzungsgesuch-de.pdf' : 'richiesta-sostegno-it.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
