import axios from "axios";
import { useEffect, useState } from "react";
import { pdf } from '@react-pdf/renderer';
import { ReportTemplate } from "./ReportTemplate";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

interface Product {
  id: string;
  category: string;
  descriptions: string;
  qty: string;
  unit: string;
  sellprice: string;
}


export default function PdfReports() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    const generateReport = async () => {
      setMessage('Loading Data & Generating PDF...');
      try {
        const res = await api.get("/productreport");
        
        if (isMounted && res.data) {
          const doc = <ReportTemplate products={res.data} />;
          
          const blob = await pdf(doc).toBlob();
          const url = URL.createObjectURL(blob);

          if (isMounted) {
            setPdfUrl(url);
            setMessage('');
          } else {
            URL.revokeObjectURL(url);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setMessage('Error loading report');
          console.error(err);
        }
      }
    };

    generateReport();

    return () => {
      isMounted = false;
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };

  }, []);

  return (

    <div className='container-fluid bg-dark vh-100 d-flex flex-column'>
      <div className='flex-grow-1 bg-white m-3 rounded overflow-hidden'>
        {message ? (
          <div className="d-flex text-dark justify-content-center align-items-center h-100">
            {message}
          </div>
        ) : (
          pdfUrl && <iframe key={pdfUrl} src={`${pdfUrl}#toolbar=1`} width="100%" height="100%" />
        )}
      </div>
    </div>

  );
}
