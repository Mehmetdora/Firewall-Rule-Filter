function AnalizButton({
  sendRules,
  analysis,
  rules,
  loading,
}) {
  let buttonName = "Çakışma Analizi Yap";

  const ifAnalysis = () => {
    if (!analysis || analysis.length == 0) {
      sendRules(rules);
    }
  };
  if (loading) {
    buttonName = "Analiz Yapılıyor...";
  } else if (analysis && analysis.length != 0) {
    buttonName = "Analiz Tamamlandı";
  }

  if(rules.length == 0){
    buttonName = "Çakışma Analizi Yap";
  }

  return (
    <button className="analiz-btn" onClick={() => ifAnalysis()}>
      <span className="analiz-btn-text">{buttonName}</span>
    </button>
  );
}

export default AnalizButton;
