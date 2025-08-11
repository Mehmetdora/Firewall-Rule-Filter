function AnalizButton({
  sendRules,
  analysis,
  rules,
  loading,
  setAnalysisModalClose,
}) {
  let buttonName = "Çakışma Analizi Yap";

  const ifAnalysis = () => {
    if (!analysis || analysis.length == 0) {
      sendRules(rules);
    }else{
      setAnalysisModalClose(false);
    }
  };
  if (loading) {
    buttonName = "Analiz Yapılıyor...";
  } else if (analysis) {
    buttonName = "Analiz Sonuçları";
  }

  return (
    <button className="analiz-btn" onClick={() => ifAnalysis()}>
      <span className="analiz-btn-text">{buttonName}</span>
    </button>
  );
}

export default AnalizButton;
