import "../styles/globals.css";

//imports global css and renders the component for the current page
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
