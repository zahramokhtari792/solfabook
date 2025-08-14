import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import FileInfoItem from '../../components/FileInfoItem';
import { useTranslation } from 'react-i18next';

const MoreAboutFile = ({ route }) => {
    const params = route?.params;
    const data = params?.data
    const { t } = useTranslation();
    const fileType = (type) => {
        if (type == '1') {
            return (
                t('Audio')
            );
        } else if (type == '2') {
            return (
                'PDF'
            );
        } else if (type == '3') {
            return (
                t('Picture')
            )
        } else if (type == '4') {
            return (t('Audio And Picture'))
        } else if (type == '5') {
            return (t('PDF And Audio'))
        } else if (type == '6') {
            return (t('video'))
        }
    }
    return (
        <SafeAreaView style={[NewStyles.container]} edges={{ top: 'off', bottom: 'maximum' }}>
            <FileInfoItem title={t('File type')} value={fileType(data?.file_type)} textDecoration={false} />
            {data?.code && <FileInfoItem title={t('Code')} value={data?.code} textDecoration={false} />}
            {data?.publish_date && <FileInfoItem title={t('Publish Date')} value={data?.publish_date} textDecoration={false} />}
            {data?.page_num > 0 && <FileInfoItem title={t('Number of pages')} value={data?.page_num} textDecoration={false} />}
            {data?.audio_time && <FileInfoItem title={t('Duration')} value={data?.audio_time} textDecoration={false} />}
            {data?.video_time && <FileInfoItem title={t('Duration')} value={data?.video_time} textDecoration={false} />}
            {data?.image_frame && <FileInfoItem title={t('Image frame')} value={data?.image_frame} textDecoration={false} />}
        </SafeAreaView>
    )
}

export default MoreAboutFile

const styles = StyleSheet.create({})