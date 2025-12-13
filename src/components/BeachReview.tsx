import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../services/api';

interface BeachReviewFormProps {
    beachId: number;
    isAuthenticated: boolean;
    onReviewSubmitted: () => void;
}

const PRIMARY_COLOR = '#1976d2';
const STAR_COLOR = '#FFC107';
const STAR_EMPTY_COLOR = '#CCC';

const BeachReviewForm: React.FC<BeachReviewFormProps> = ({
    beachId,
    isAuthenticated,
    onReviewSubmitted
}) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validação 1: Usuário Logado
        if (!isAuthenticated) {
            Alert.alert("Atenção", "Você precisa estar logado para avaliar esta praia.");
            return;
        }

        // Validação 2: Comentário preenchido
        if (!comment.trim()) {
            Alert.alert("Campo Obrigatório", "Por favor, escreva um comentário sobre sua experiência.");
            return;
        }

        setLoading(true);

        try {
            const reviewData = {
                beach_id: beachId,
                comment_text: comment,
                rating: rating,
            };

            // ✅ MUDANÇA: Usando api.post em vez de fetch
            // O Axios já envia o Token e usa a BaseURL configurada no services/api.ts
            await api.submitReview(reviewData);
            
            Alert.alert("Sucesso", "Sua avaliação foi enviada! Obrigado por contribuir.");

            // Limpa o formulário
            setComment('');
            setRating(undefined);

            // Atualiza a lista na tela anterior
            onReviewSubmitted();

        } catch (error: any) {
            console.error("Erro ao enviar avaliação:", error);
            const errorMessage = error.response?.data?.message || "Não foi possível enviar sua avaliação. Tente novamente.";
            Alert.alert("Erro", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Se não estiver logado, mostra aviso visual (opcional, já tratado no click)
    if (!isAuthenticated) {
        return (
            <View style={styles.authMessage}>
                <Icon name="account-lock" size={24} color="#B45309" />
                <Text style={styles.authMessageText}>
                    Faça login para deixar sua avaliação.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.formContainer}>
            <Text style={styles.modalTitle}>Deixe sua Avaliação</Text>

            {/* Seletor de Estrelas */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nota (Opcional)</Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <TouchableOpacity
                            key={n}
                            onPress={() => setRating(n)}
                            style={styles.starButton}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name={n <= (rating || 0) ? 'star' : 'star-outline'}
                                size={32}
                                color={n <= (rating || 0) ? STAR_COLOR : STAR_EMPTY_COLOR}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Campo de Texto */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Comentário</Text>
                <TextInput
                    style={styles.textArea}
                    onChangeText={setComment}
                    value={comment}
                    placeholder="Compartilhe sua experiência sobre a praia..."
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={1000}
                />
            </View>

            {/* Botão de Enviar */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        // Sombra suave para destacar o formulário
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
    },
    starButton: {
        marginHorizontal: 5,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        height: 100,
        backgroundColor: '#f9f9f9',
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#a0c4ff', // Cor mais clara quando desabilitado
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    authMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FCD34D',
        borderRadius: 8,
        marginTop: 20,
        gap: 10,
    },
    authMessageText: {
        color: '#B45309',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default BeachReviewForm;