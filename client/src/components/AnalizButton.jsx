function AnalizButton({ sendRules, rules, loading }) {
  return (
    <button className="analiz-btn" onClick={() => sendRules(rules)}>
      <span className="analiz-btn-text">
        {loading ? "İşleniyor..." : "Çakışma Analizi Yap"}
      </span>
    </button>
  );
}

export default AnalizButton;
