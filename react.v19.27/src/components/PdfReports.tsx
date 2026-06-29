import { useEffect, useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ProductService } from '../_schema/productv1/product_pb';
import { type ProductData } from '../_schema/productv1/product_pb';

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});

const productClient = createClient(ProductService, transport);
const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    fontSize: 10,
    top: 10,
    left: 0,
    right: 10,
    textAlign: 'right',
    color: '#666666',
  },  
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  titleContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Table Container
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 2,
  },
  // Table Row (used for both header and body)
  tableRow: {
    flexDirection: 'row',
  },
  // Table Header Specific Row
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  // Table Cell Formatting
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 3,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 3,
  },
  // Column Width Layout (Ensure they sum up to 100%)
  colId: {
    width: '20%',
  },
  colDescription: {
    width: '60%',
  },
  colQty: {
    width: '30%',
  },
  colUnit: {
    width: '30%',
  },
  colPrice: {
    width: '40%',
  },
  tableCell: {
    fontSize: 10,
  },
  emptyText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  }
});


const ProductReportDocument = ({ products }: { products: ProductData[] }) => (
  <Document>

    <Page size="A4" style={styles.page}>

      <Text 
        style={styles.footer} 
        render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} 
        fixed 
      />


      <View style={styles.titleContainer}>
        <Text style={styles.heading}>Product Inventory Report</Text>
      </View>
      
      {products.length === 0 ? (
        <Text style={styles.emptyText}>No product data available.</Text>
      ) : (
        /* Table Wrapper */
        <View style={styles.table}>
          
          /* Table Header */
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableColHeader, styles.colId]}>
              <Text style={styles.tableCell}>#</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colDescription]}>
              <Text style={styles.tableCell}>Description</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colQty]}>
              <Text style={styles.tableCell}>Stocks</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colUnit]}>
              <Text style={styles.tableCell}>Unit</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colPrice]}>
              <Text style={styles.tableCell}>CostPrice</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colPrice]}>
              <Text style={styles.tableCell}>SellPrice</Text>
            </View>
          </View>

          /* Table Body Rows */
          {products.map((product, index) => (

            <View key={product.id || index} style={styles.tableRow}>

              <View style={[styles.tableCol, styles.colId]}>
                <Text style={styles.tableCell}>{product.id}</Text>
              </View>

              <View style={[styles.tableCol, styles.colDescription]}>
                <Text style={styles.tableCell}>{product.descriptions}</Text>
              </View>

              <View style={[styles.tableCol, styles.colQty]}>
                <Text style={styles.tableCell}>{product.qty}</Text>
              </View>
              <View style={[styles.tableCol, styles.colUnit]}>
                <Text style={styles.tableCell}>{product.unit}</Text>
              </View>
              <View style={[styles.tableCol, styles.colPrice]}>
                <Text style={styles.tableCell}>{product.costPrice}</Text>
              </View>
              <View style={[styles.tableCol, styles.colPrice]}>
                <Text style={styles.tableCell}>${product.sellPrice?.toString() || '0.00'}</Text>
              </View>
            </View>
          ))}
          
        </View>
      )}


    </Page>

  </Document>

);

export default function PdfReports() {
  const [message, setMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  
  useEffect(() => {
    const generateReport = async () => {
      try {
        const response = await productClient.getProductPdfReport({});
        setProducts(response.products);
      } catch (err) {
        const connectErr = ConnectError.from(err);
        console.error(connectErr);
        const cleanMessage = connectErr.rawMessage.includes("desc = ")
          ? connectErr.rawMessage.split("desc = ")[1]
          : connectErr.rawMessage;
        setMessage(cleanMessage);
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    };

    generateReport();
  }, []);

  return (
    <div className='container-fluid bg-dark vh-100 d-flex flex-column text-white p-4'>
      <h1 className="mb-3">PRODUCT PDF REPORT</h1>
      {message && <div className="alert alert-danger">{message}</div>}
      
      {/* PDFViewer embeds an iframe natively showing the generated PDF */}
      <div className="flex-grow-1 w-100 bg-white rounded overflow-hidden">
        <PDFViewer width="100%" height="90%" style={{ border: 'none' }}>
          <ProductReportDocument products={products} />
        </PDFViewer>
      </div>
    </div>
  );
}
