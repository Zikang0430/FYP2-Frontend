import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Button } from 'react-native';
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
    const [uploadedImageUri, setUploadedImageUri] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
    const cameraRef = useRef(null);

    useEffect(() => {
        if (cameraPermission?.granted && mediaLibraryPermissionResponse?.status === 'granted') {
            getRecentPhotos();
        }
    }, [cameraPermission, mediaLibraryPermissionResponse]);

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

    const uploadPhoto = async (uri) => {
        setLoading(true); // Start loading
        const formData = new FormData();
        formData.append('image', {
            uri,  // Ensure this is the correct URI for the file
            name: 'photo.jpg',  // Assign a file name
            type: 'image/png',  // Specify the MIME type based on your image format
        });
    
        try {
            const response = await fetch('http://192.168.0.111:8000/upload/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setUploadedImageUri(data.image_url); // Assuming the server returns the URL in 'image_url'
            setModalVisible(true); // Show the modal with uploaded image
        } catch (error) {
            console.error("Upload failed:", error);
            Alert.alert("Upload Failed", "There was an error uploading your image.");
        } finally {
            setLoading(false); // Stop loading
        }
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
                        await uploadPhoto(photo.uri);
                        getRecentPhotos();
                    }
                }}>
                    <Icon name="camera-alt" size={32} color="black" />
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Uploading photo...</Text>
                </View>
            )}

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

            {/* Modal for Uploaded Image Confirmation */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Uploaded Image</Text>
                        {uploadedImageUri && (
                            <Image
                                source={{ uri: uploadedImageUri }}
                                style={styles.uploadedImage}
                            />
                        )}
                        <Button title="Confirm" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: 'white',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    uploadedImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
});