function AnalizButton({ sendRules, analysis, rules, loading }) {
  let buttonName = "Çakışma Analizi Yap";

  if (loading) {
    buttonName = "Analiz Yapılıyor...";
  } else if (analysis) {
    buttonName = "Analiz Sonuçları";
  }

  return (
    <button className="analiz-btn" onClick={() => sendRules(rules)}>
      <span className="analiz-btn-text">{buttonName}</span>
    </button>
  );
}

export default AnalizButton;
