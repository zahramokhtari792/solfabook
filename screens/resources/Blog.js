import { Image, Linking, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import { imageUri, mainUri } from '../../services/URL';
import Button from '../../components/Button';
const Blog = ({ route }) => {
    const params = route?.params;
    const data = params?.data
    const htmlContent = `
        <html dir="rtl">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                <style>
                    body {
                        font-size: 16px;
                        line-height: 1.6;
                        padding: 10px;
                        color: #333;
                        margin: 0;
                        overflow-x: hidden; /* جلوگیری از اسکرول افقی */
                        word-wrap: break-word; /* شکستن متن‌های طولانی */
                        
                    }
                    * {
                        max-width: 100% !important; /* هیچ عنصری بیشتر از عرض صفحه نشه */
                        box-sizing: border-box;
                    }
                    img, video, iframe {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse;
                    }
                </style>
            </head>
            <body>
            <img src="${imageUri}/${data?.image_path}" >
                ${data?.short_description}
                ${data?.long_description}
            </body>
        </html>
    `;
    return (
        <SafeAreaView edges={{top:'off', bottom:'additive'}} style={NewStyles.container}>
            {/* <Image source={{uri:`${imageUri}/${data?.image_path}`}} style={{width:'100%', aspectRatio:1.5, resizeMode:'contain'}} /> */}
            <WebView
                style={[styles.container]}
                originWhitelist={['*']}
                scrollEnabled={false}
                source={{ html: htmlContent }}
                scalesPageToFit={false}  // مقیاس‌بندی اتوماتیک رو غیرفعال می‌کنه
            />
            <View style={{paddingHorizontal:'5%'}}>
                <Button title={'مشاهده کامل در وبسایت'} onPress={()=>{
                    Linking.openURL(`${mainUri}/blog/${data?.id}`)
                }} />
            </View>
        </SafeAreaView>
    )
}

export default Blog

const styles = StyleSheet.create({
    container: {
        // flex: 1,
    },
})