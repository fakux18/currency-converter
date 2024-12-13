import { useState, useEffect } from "react";
import styles from "./Converter.module.scss";

const API_URL = "https://api.vatcomply.com/rates";

interface ConversionData {
  rates: Record<string, number>;
}

export const ConvertionResult = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(1.0); // Monto inicial 1.00
  const [fromCurrency, setFromCurrency] = useState<string>("EUR"); // Moneda inicial
  const [toCurrency, setToCurrency] = useState<string>("USD"); // Moneda objetivo
  const [result, setResult] = useState<number | null>(null); // Resultado de la conversión

  // Maneja el cambio de input y evita valores negativos
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir valores vacíos para borrar completamente el input
    if (value === "") {
      setAmount(""); // Esto para que el 0 no quede siempre en el input
      return;
    }

    // Convertir el valor a número si es válido
    const numericValue = parseFloat(value);
    setAmount(numericValue >= 0 ? numericValue : 0); // Asegurarse de que no sea negativo
  };

  // Realiza la conversión usando el API
  const fetchConversionRate = async () => {
    try {
      const response = await fetch(`${API_URL}?base=${fromCurrency}`);
      const data: ConversionData = await response.json();

      const rate = data.rates[toCurrency];
      setResult(rate * amount); // Calcula el resultado
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
    }
  };
  useEffect(() => {
    // Llamada a la API para obtener la tasa de cambio USD -> EUR
    fetch("https://api.vatcomply.com/rates?base=USD")
      .then((response) => response.json())
      .then((data) => {
        const rateEUR = data.rates.EUR; // Obtener la tasa de EUR
        setExchangeRate(rateEUR);
      })
      .catch((error) => console.error("Error fetching exchange rate:", error));
  }, []);

  // Llama al cálculo automáticamente al cambiar input o monedas
  useEffect(() => {
    fetchConversionRate();
  }, [amount, fromCurrency, toCurrency]);

  // Intercambia las monedas (from <-> to)
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <>
      <div className={styles["main"]}>
        <div className={styles["converter-container-main"]}>
          <div className={styles["converter-container"]}>
            <div className={styles["input-group"]}>
              {/* <div className={styles["amount-section"]}> */}
              <label htmlFor="amount" className={styles["amount-label"]}>
                Amount
              </label>
              <input
                type="number"
                id="amount"
                className={styles["amount-input"]}
                value={amount === "" ? "" : amount} // Manejar el estado vacío
                onChange={handleAmountChange}
              />
            </div>
            <div
              className={`${styles["input-group"]} ${styles["currency-group"]}`}
            >
              <label htmlFor="from" className={styles["currency-label"]}>
                From
              </label>
              <select
                id="from"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className={styles["currency-select"]}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div
              onClick={swapCurrencies}
              className={styles["container-icon-change"]}
            >
              <figure className={styles["icon-change"]}>
                <img src="public/icon-lg.svg" alt="logo" />
              </figure>
            </div>
            <div className={styles["input-group"]}>
              <label htmlFor="to" className={styles["currency-label"]}>
                To
              </label>
              <select
                id="to"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className={styles["currency-select"]}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          <div className={styles["result-section"]}>
            <div className={styles["result-section-left"]}>
              <p className={styles["result-text"]}>
                {amount} {fromCurrency} = <br /> {result?.toFixed(4) || "0.00"}{" "}
                {toCurrency}
              </p>
              <p className={styles["result-text-info"]}>
                1 USD = {exchangeRate?.toFixed(4)} EUR
              </p>
            </div>
            <div className={styles["result-section-right"]}>
              <p className={styles["result-text-market"]}>
                We use the mid-market rate for our Converter. This is for
                informational purposes only. You won’t receive this rate when
                sending money.
              </p>
              <p className={styles["result-text-currency-update"]}>
                <u>Euro</u> to US <u>Dollar</u> conversion — Last updated Dec
                15, 2022, 19:17 UTC
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className={styles["result-text-currency-update-hidden"]}>
        <u>Euro</u> to US <u>Dollar</u> conversion — Last updated Dec 15, 2022,
        19:17 UTC
      </p>
    </>
  );
};
