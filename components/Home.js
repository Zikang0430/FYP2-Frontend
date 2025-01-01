import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Button, RefreshControl, ImageBackground, TouchableWithoutFeedback } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;
const photoSize = (screenWidth - 40) / 5; // 4 columns with spacing

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
    const [oginalImageUri, setOginalImageUri] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
    const cameraRef = useRef(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const serverIP = '192.168.68.58';
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const [imagePath, setImagePath] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();

            if (mediaLibraryStatus.status === 'granted') {
                getRecentPhotos();
            } else {
                Alert.alert(
                    'Permission Required',
                    'Please enable Media Library access in your device settings to use this feature.'
                );
            }
        })();
    }, []);

    useEffect(() => {
        if (cameraPermission?.granted && mediaLibraryPermissionResponse?.status === 'granted') {
            getRecentPhotos();
        }
    }, [cameraPermission, mediaLibraryPermissionResponse]);
    
    const handleImageLoad = (event) => {
        const { width, height } = event.nativeEvent.source;
    
        // 计算宽高比例
        const aspectRatio = width / height;
    
        // 初始化缩放后的宽高
        let scaledWidth = width;
        let scaledHeight = height;
    
        // 限制宽度不超过屏幕宽度的 90%
        if (scaledWidth > screenWidth * 0.7) {
            scaledWidth = screenWidth * 0.7;
            scaledHeight = scaledWidth / aspectRatio;
        }
    
        // 限制高度不超过屏幕高度的 70%
        if (scaledHeight > screenHeight * 0.5) {
            scaledHeight = screenHeight * 0.5;
            scaledWidth = scaledHeight * aspectRatio;
        }
    
        setImageDimensions({ width: scaledWidth, height: scaledHeight });
    };
    
    const sendCoordinatesToBackend = async (x, y, imagePath) => {
        console.log("Normalized coordinates sent to backend:", { x, y });
        console.log("API endpoint:", `http://${serverIP}:8000/crop_and_process/`);
        try {
            const response = await fetch(`http://${serverIP}:8000/crop_and_process/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_path: imagePath,
                    x: x, // Normalized x-coordinate
                    y: y, // Normalized y-coordinate
                }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            // Navigate to Products screen with data
            navigation.navigate('Products', { products: data.respond });
        } catch (error) {
            console.error('Error sending coordinates to backend:', error);
            Alert.alert('Error', 'Failed to send coordinates to the backend.');
        }
    };
    
    const handleImagePress = (event) => {
        const { locationX, locationY } = event.nativeEvent;
        const relativeX = locationX / imageDimensions.width; // Normalize by image width
        const relativeY = locationY / imageDimensions.height; // Normalize by image height
    
        console.log("Tapped coordinates:", { locationX, locationY });
        console.log("Normalized coordinates:", { relativeX, relativeY });
        
        const cleanedImagePath = imagePath.replace(`http://${serverIP}:8000/media/`, '');
        console.log("Cleaned image path:", cleanedImagePath);

        sendCoordinatesToBackend(relativeX, relativeY, cleanedImagePath); // Pass normalized values
    };
    
    const handleRefresh = async () => {
        setIsRefreshing(true);
        // whole page will be refreshed
        await getRecentPhotos();
        setIsRefreshing(false);
    };

    const getRecentPhotos = async () => {
        try {
            if (mediaLibraryPermissionResponse?.status === 'granted') {
                // Get all albums
                const albums = await MediaLibrary.getAlbumsAsync();
                let allAssets = [];

                // Fetch photos from each album
                for (const album of albums) {
                    const { assets } = await MediaLibrary.getAssetsAsync({
                        album: album.id, // Fetch photos for the current album
                        sortBy: MediaLibrary.SortBy.modificationTime, // Sort by creation time
                        mediaType: MediaLibrary.MediaType.photo, // Only photos
                        first: 20, // Adjust the number of photos per album
                    });
                    allAssets = allAssets.concat(assets); // Combine all photos
                }

                // Sort all fetched photos by time (latest first)
                allAssets.sort((a, b) => b.modificationTime - a.modificationTime);

                // Extract URIs from the sorted photos
                const uris = allAssets.map(asset => asset.uri);

                // Display the urls and date taken after convert in the console
                // for (const asset of allAssets) {
                //     console.log('URI:', asset.uri);
                //     console.log('Date taken:', new Date(asset.modificationTime));
                // }

                // limit the number of photos to display
                uris.length = 32;

                setRecentPhotos(uris); // Save the sorted URIs to state
            } else {
                console.error('Media Library permission not granted.');
                Alert.alert('Permission Required', 'Please grant Media Library access to use this feature.');
            }
        } catch (error) {
            console.error('Error fetching photos from all albums:', error);
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
        console.log('Uploading photo:', uri);
        setLoading(true);
        const formData = new FormData();
        formData.append('image', {
            uri, 
            name: 'photo.jpg',
            type: 'image/jpeg',
        });
    
        try {
            const response = await fetch(`http://${serverIP}:8000/upload/`, {
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
            console.log("Image, data:", data.image_url);
            setImagePath(data.image_url); // Set the imagePath here
            setUploadedImageUri(data.image_url);
            setOginalImageUri(uri);
            setModalVisible(true);
        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Upload Failed', 'There was an error uploading your image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={['#4CAF50', '#FF9800', '#F44336']}
                    progressBackgroundColor="#E0E0E0"
                    size="large"
                    tintColor="#4CAF50"
                />
            }
            contentContainerStyle={styles.container}
        >
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
                </View>

                <TouchableOpacity
                    style={styles.roundButton}
                    onPress={async () => {
                        if (cameraRef.current) {
                            const photo = await cameraRef.current.takePictureAsync();
                            await MediaLibrary.saveToLibraryAsync(photo.uri);
                            await uploadPhoto(photo.uri);
                            getRecentPhotos();
                        }
                    }}
                >
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
                        <Text styler={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                    {mediaLibraryPermissionResponse?.status !== 'granted' && (
                        <TouchableOpacity
                            style={styles.permissionButton}
                            onPress={() => requestMediaLibraryPermission()}
                        >
                            <Text style={styles.permissionButtonText}>Grant Permission</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {mediaLibraryPermissionResponse?.status === 'granted' ? (
                    <ScrollView contentContainerStyle={styles.photoGrid}>
                        {recentPhotos.slice(0, 60).map((photoUri, index) => (
                            <TouchableOpacity key={index} onPress={() => uploadPhoto(photoUri)}>
                                <Image source={{ uri: photoUri }} style={styles.recentPhoto} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.noPermissionContainer}>
                        <Text style={styles.noPhotosText}>
                            Permission to access photos is required to display albums.
                        </Text>
                    </View>
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            {
                                width: Math.min(screenWidth * 0.8, imageDimensions.width), // 限制宽度不超过屏幕的 90%
                                height: Math.min(screenHeight * 0.6, imageDimensions.height), // 限制高度不超过屏幕的 70%
                            },
                        ]}
                    >
                        {/* 右上角的关闭按钮 */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Uploaded Image</Text>
                        {uploadedImageUri && (
                            <TouchableWithoutFeedback onPress={handleImagePress}>
                                <Image
                                    source={{ uri: uploadedImageUri }}
                                    style={{
                                        width: Math.min(screenWidth * 0.7, imageDimensions.width), // 动态调整宽度
                                        height: Math.min(screenHeight * 0.5, imageDimensions.height), // 动态调整高度
                                        resizeMode: "contain", // 保持图片比例
                                    }}
                                    onLoad={handleImageLoad}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // 让内容正确填充父视图
        backgroundColor: '#ECEFF1',
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
        flex: 1,
        width: '100%',
        height: 500, // 确保分配足够高度
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
        width: photoSize,
        height: photoSize,
        borderRadius: 0,
        margin: 5,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1,
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
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        overflow: 'hidden',
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
    noPhotosText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    permissionButton: {
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        marginVertical: 10,
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
    noPermissionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        position: 'relative', // 必须相对定位以放置关闭按钮
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        backgroundColor: '#f8f8f8',
        borderRadius: 50,
    },
    uploadedImage: {
        borderRadius: 10,
    },
}); 