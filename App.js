import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function App() {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaLibraryPermissionResponse, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
    const [cameraProps, setCameraProps] = useState({
        zoom: 0,
        facing: 'back',
        flash: 'off',
    });
    const [recentPhotos, setRecentPhotos] = useState([]);
    const cameraRef = useRef(null);

    useEffect(() => {
        if (cameraPermission?.granted && mediaLibraryPermissionResponse?.status === 'granted') {
            getRecentPhotos();
        }
    }, [cameraPermission, mediaLibraryPermissionResponse]);

    if (!cameraPermission || !mediaLibraryPermissionResponse) {
        return <View />;
    }

    if (!cameraPermission.granted || mediaLibraryPermissionResponse.status !== 'granted') {
        return (
            <View style={styles.container}>
                <Text>We need camera and media library permissions to continue.</Text>
                <TouchableOpacity style={styles.button} onPress={() => {
                    requestCameraPermission();
                    requestMediaLibraryPermission();
                }}>
                    <Text style={styles.buttonText}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getRecentPhotos = async () => {
        if (mediaLibraryPermissionResponse.status === 'granted') {
            const { assets } = await MediaLibrary.getAssetsAsync({
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                mediaType: MediaLibrary.MediaType.photo,
                first: 12,
            });
            setRecentPhotos(assets.map(asset => asset.uri));
        }
    };

    const handleSwitchCamera = () => {
        setCameraProps(prevProps => ({
            ...prevProps,
            facing: prevProps.facing === 'back' ? 'front' : 'back',
        }));
    };

    const handleToggleFlash = () => {
        setCameraProps(prevProps => ({
            ...prevProps,
            flash: prevProps.flash === 'off' ? 'on' : 'off',
        }));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Visual Search System</Text>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    zoom={cameraProps.zoom}
                    facing={cameraProps.facing}
                    flash={cameraProps.flash}
                    ref={cameraRef}
                />
                <View style={styles.iconOverlay}>
                    <TouchableOpacity onPress={handleToggleFlash}>
                        <Icon name={cameraProps.flash === 'off' ? 'flash-off' : 'flash-on'} size={28} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSwitchCamera}>
                        <Icon name="flip-camera-ios" size={28} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert("History", "View search history here.")}>
                        <Icon name="history" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.roundButton} onPress={async () => {
                    if (cameraRef.current) {
                        const photo = await cameraRef.current.takePictureAsync();
                        await MediaLibrary.saveToLibraryAsync(photo.uri);
                        getRecentPhotos();
                    }
                }}>
                    <Icon name="camera-alt" size={32} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.recentPhotoContainer}>
                <View style={styles.albumHeader}>
                    <Text style={styles.albumText}>Search from Album</Text>
                    <TouchableOpacity onPress={() => Alert.alert("See All", "View all photos.")}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.photoGrid}>
                    {recentPhotos.map((photoUri, index) => (
                        <Image key={index} source={{ uri: photoUri }} style={styles.recentPhoto} />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F5',
        paddingHorizontal: 20,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#444',
        marginBottom: 20,
        textAlign: 'center',
    },
    cameraContainer: {
        flex: 2,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    camera: {
        flex: 1,
    },
    iconOverlay: {
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'column',
        gap: 18,
    },
    roundButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    recentPhotoContainer: {
        flex: 1,
        width: '100%',
    },
    albumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    albumText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    seeAllText: {
        color: '#007AFF',
        fontSize: 14,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    recentPhoto: {
        width: '30%',
        height: 100,
        borderRadius: 8,
    },
});
