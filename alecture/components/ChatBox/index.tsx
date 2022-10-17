import React, { FC, MouseEvent, useCallback, KeyboardEvent, useEffect, useRef, ReactNode } from 'react'
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from './styles';
import autosize from 'autosize';
import { Mention, SuggestionDataItem } from 'react-mentions';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import gravatar from 'gravatar';

// type SubmitFormEvent = MouseEvent<HTMLFormElement> | KeyboardEvent<HTMLFormElement>;

interface Props {
  chat: string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}

const ChatBox: FC<Props>= ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { workspace } = useParams<{workspace: string }>();
  const { data: userData, error, mutate } = useSWR<IUser | false>('/api/users', fetcher); 
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  
  useEffect(() => { 
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeydownChat = useCallback((e: any) => {
    console.log(e)
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        onSubmitForm(e);
      }
    }
  }, [onSubmitForm]);

  const renderSuggestion = useCallback((
    suggestion: SuggestionDataItem, 
    search: string, 
    highlightedDisplay: ReactNode, 
    index: number, 
    focused: boolean
  ): ReactNode => {
    if (!memberData) return;

    return (
      <EachMention focus={focused} >
        <img 
          src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })} 
          alt={memberData[index].nickname}  
        />
        <span>{highlightedDisplay}</span>
      </EachMention>
    )    
  }, [memberData]);

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea 
          id="editor-chat"
          value={chat} 
          onChange={onChangeChat}
          onKeyDown={onKeydownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          forceSuggestionsAboveCursor
          >
          {/*
            allowSuggestionsAboveCursor -> 자리가 없을때 커서 위로 
            forceSuggestionsAboveCursor -> 강제 커서 위로
          */}
          <Mention 
            appendSpaceOnAdd 
            trigger="@" 
            data={memberData?.map((v) => ({ id: v.id, display: v.nickname })) || []} 
            renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  )
}

export default ChatBox