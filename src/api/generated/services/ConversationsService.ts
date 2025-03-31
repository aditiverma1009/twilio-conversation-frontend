/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddParticipantsDto } from '../models/AddParticipantsDto';
import type { ApiResponseDto } from '../models/ApiResponseDto';
import type { CreateConversationDto } from '../models/CreateConversationDto';
import type { GetConversationResponseDto } from '../models/GetConversationResponseDto';
import type { GetConversationsResponseDto } from '../models/GetConversationsResponseDto';
import type { GetParticipantsResponseDto } from '../models/GetParticipantsResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConversationsService {
    /**
     * Get all conversations
     * @param status
     * @returns GetConversationsResponseDto List of conversations with pagination
     * @throws ApiError
     */
    public static conversationsControllerGetConversations(
        status: string,
    ): CancelablePromise<GetConversationsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/conversations',
            query: {
                'status': status,
            },
        });
    }
    /**
     * Create a new conversation
     * @param requestBody
     * @returns GetConversationResponseDto The conversation has been created
     * @throws ApiError
     */
    public static conversationsControllerCreateConversation(
        requestBody: CreateConversationDto,
    ): CancelablePromise<GetConversationResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/conversations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a conversation by SID
     * @param conversationSid
     * @returns GetConversationResponseDto Conversation details with participants
     * @throws ApiError
     */
    public static conversationsControllerGetConversation(
        conversationSid: string,
    ): CancelablePromise<GetConversationResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/conversations/{conversationSid}',
            path: {
                'conversationSid': conversationSid,
            },
        });
    }
    /**
     * Get participants of a conversation
     * @param conversationSid
     * @returns GetParticipantsResponseDto List of participants
     * @throws ApiError
     */
    public static conversationsControllerGetParticipants(
        conversationSid: string,
    ): CancelablePromise<GetParticipantsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/conversations/{conversationSid}/participants',
            path: {
                'conversationSid': conversationSid,
            },
        });
    }
    /**
     * Add participants to a conversation
     * @param conversationSid
     * @param requestBody
     * @returns GetParticipantsResponseDto The participants have been added
     * @throws ApiError
     */
    public static conversationsControllerAddParticipants(
        conversationSid: string,
        requestBody: AddParticipantsDto,
    ): CancelablePromise<GetParticipantsResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/conversations/{conversationSid}/participants',
            path: {
                'conversationSid': conversationSid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove a participant from a conversation
     * @param conversationSid
     * @param participantSid
     * @returns ApiResponseDto The participant has been removed
     * @throws ApiError
     */
    public static conversationsControllerRemoveParticipant(
        conversationSid: string,
        participantSid: string,
    ): CancelablePromise<ApiResponseDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/conversations/{conversationSid}/participants/{participantSid}',
            path: {
                'conversationSid': conversationSid,
                'participantSid': participantSid,
            },
        });
    }
}
