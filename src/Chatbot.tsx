import React, { useEffect, useRef, useState } from "react"
import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from "openai"
import "./Chatbot.css"
import TextareaAutosize from "react-textarea-autosize"
import ReactMarkdown from "react-markdown"

import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import typetoneImg from "./typetone.png"
import LetteredAvatar from "react-lettered-avatar"

const arrayWithColors = ["#2ecc71", "#3498db", "#8e44ad", "#e67e22", "#e74c3c", "#1abc9c", "#2c3e50"]

const configuration = new Configuration({
  apiKey: "api-key"
})
const openai = new OpenAIApi(configuration)

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ content: string, role: ChatCompletionRequestMessageRoleEnum }>>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [height, setHeight] = useState(0)
  const chatRef = useRef<HTMLDivElement | null>(null)
  const submitBtnRef = useRef<HTMLButtonElement | null>(null)

  const handleSendMessage = async (content: string): Promise<void> => {
    const updatedMessage = [
      ...messages,
      { content, role: ChatCompletionRequestMessageRoleEnum.User },
      {
        content: "loading...",
        role: ChatCompletionRequestMessageRoleEnum.Assistant
      }
    ]

    setMessages(updatedMessage)
    let result = ""

    try {
      const apiResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: updatedMessage
      })
      result = apiResponse.data.choices[0].message?.content ?? ""
    } catch (e: unknown) {
      result = `Error: ${(e as Error).message}`
    } finally {
      updatedMessage.pop()
    }
    setMessages([
      ...updatedMessage,
      {
        content: result,
        role: ChatCompletionRequestMessageRoleEnum.Assistant
      }
    ])
  }
  const handleSubmit = async (event: React.FormEvent<any>): Promise<void> => {
    event.preventDefault()
    if (isEmpty(inputValue)) return
    setLoading(true)
    void handleSendMessage(inputValue).finally(() => {
      setLoading(false)
    })
    setInputValue("")
  }

  const handleChange = (event: any): void => {
    setInputValue(event.target.value)
  }

  const onKeyUpOrDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (submitBtnRef.current != null && event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault()
      submitBtnRef.current.click()
    }
  }

  useEffect(() => {
    if (chatRef.current !== null) {
      const anchor = chatRef.current.querySelector("#scroll-to-anchor")
      const height = anchor?.clientHeight ?? 0
      console.log("scroll bottom", anchor?.clientHeight ?? 0)
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight - height - height / 2, behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="chat-container">
      <div ref={chatRef} style={{ height: `calc(100vh - ${height}px)` }} className="chatbot-messages">
        {messages.map((message, index) => {
          const isBotMessage = message.role === "assistant"
          return (
            <div
              id={isBotMessage && messages.length - 1 === index ? "scroll-to-anchor" : undefined}
              key={index}
              className={`chat-bubble ${isBotMessage ? "chat-bubble-bot" : "chat-bubble-user"}`}
            >
              {isBotMessage && <img src={typetoneImg} alt="Avatar" className="avatar" />}
              {!isBotMessage && (
                <LetteredAvatar name={"You"} size={32} backgroundColors={arrayWithColors} radius={32} color="#fff" />
              )}
              <div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code ({ node, inline = false, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className ?? "")
                      return !inline && match != null
                        ? (
                        <SyntaxHighlighter {...props} style={vscDarkPlus} language={match[1]} PreTag="div">
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                          )
                        : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                          )
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          )
        })}
      </div>

      <form
        className="chatbot-input"
        onSubmit={e => {
          void handleSubmit(e)
        }}
      >
        <TextareaAutosize
          rows={1}
          disabled={loading}
          onHeightChange={height => {
            setHeight(height)
          }}
          maxRows={4}
          placeholder="Ask me anything..."
          value={inputValue}
          onKeyDown={onKeyUpOrDown}
          onKeyUp={onKeyUpOrDown}
          onChange={handleChange}
        />
        <button disabled={loading} ref={submitBtnRef} type="submit">
          {loading ? "loading" : "Send"}
        </button>
      </form>
    </div>
  )
}

export default Chatbot

function isEmpty (inputValue: string): boolean {
  return inputValue === undefined || inputValue === null || inputValue === ""
}
