import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import { useWindowSize } from '../useWindowSize.ts';
import { PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'}
})

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  logo: { width: 140, height: 30, marginBottom: 10 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  categorySection: { marginBottom: 15 },
  categoryTitle: { fontSize: 14, backgroundColor: '#f0f0f0', padding: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 5 },
  tableHeader: { fontWeight: 'bold', backgroundColor: '#fafafa' },
  col: { flex: 1 },
  row: { flexDirection: 'row', borderBottom: '1px solid #EEE', padding: 5 },
  cell: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 20,
    textAlign: 'right',
    fontSize: 10,
    color: 'grey',
  },

});


export interface Products {
  id: string;
  descriptions: string;
  qty: number;
  unit: string;
  costprice: number;
  sellprice: number;
  saleprice: number;
  productpicture: string;
  alertstocks: number;
  criticalstocks: number;
}

export interface Category {
  category: string;
  products: Products[];
}

export interface ProductCategoriesData {
  categories: Category[];
}

export default function ProductbyCategory() {
    const [message, setMessage] = useState<string>('');
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const { width, height } = useWindowSize();

    useEffect(() => {

        const getallCategories = async () => {
            setMessage("Loading inventory data...");
            try {
                const res = await api.get('/categories')
                console.log(res.data);
                setCategoryData(res.data);
                
            } catch (err: any) {  
                if (err.AbortError) {
                    setMessage(err.message);
                }
                setTimeout(() => { setMessage('');  }, 1000);
            }

        }

        getallCategories()
        
    },[])

  return (
  <div className="container-fluid">

{categoryData ? (
  
  <div className="container-fluid"> 
    <PDFViewer width={width-50} height={height}>

        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.headerContainer}>
              <View>
              <Image 
                src={'/images/logo.png'}
                style={styles.logo} 
              />

                <Text style={styles.headerTitle}>Product Report</Text>
                <Text style={{ fontSize: 10, color: '#666' }}>
                  Generated on {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              
            </View>

            {categoryData.map((cat, i) => (
              <View key={i} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{cat.category}</Text>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={{width: 250}}>Descriptions</Text>
                  <Text style={styles.col}>Qty</Text>
                  <Text style={styles.col}>Unit</Text>
                  <Text style={styles.col}>Sell Price</Text>
                </View>
                {cat.products.map((prod) => (
                  <View key={prod.id} style={styles.tableRow}>
                    <Text style={{width: 250}}>{prod.descriptions}</Text>
                    <Text style={styles.col}>{prod.qty}</Text>
                    <Text style={styles.col}>{prod.unit}</Text>
                    <Text style={styles.col}>
                      ${Number(prod.sellprice || 0).toFixed(2)}                
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            <Text 
              style={styles.footer} 
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
              fixed 
            />

          </Page>
        </Document>

    </PDFViewer>
    <br/><br/><br/><br/>
  </div>
) : (
  <p>{message}</p>
)}    
  </div>
  )
}