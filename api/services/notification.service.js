import Notification from '../models/Notification.js'

export async function createNotification(data) {
  const { recipient, type, actor, reference, content } = data

  // Don't notify yourself
  if (actor._id.toString() === recipient.toString()) {
    return null
  }

  try {
    const notification = await Notification.create({
      recipient,
      type,
      actor: {
        _id: actor._id,
        username: actor.username,
        displayName: actor.displayName,
        avatar: actor.avatar?.url || null,
      },
      reference,
      content,
    })

    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    return null
  }
}

export async function createCommentReplyNotification(comment, parentComment, post) {
  return createNotification({
    recipient: parentComment.author._id,
    type: 'comment_reply',
    actor: comment.author,
    reference: {
      type: 'comment',
      id: comment._id,
      postId: post._id,
    },
    content: comment.content.substring(0, 100),
  })
}

export async function createCommentLikeNotification(comment, liker) {
  return createNotification({
    recipient: comment.author._id,
    type: 'comment_like',
    actor: liker,
    reference: {
      type: 'comment',
      id: comment._id,
      postId: comment.post,
    },
    content: comment.content.substring(0, 100),
  })
}

export async function createMentionNotification(mentionedUserId, comment, post) {
  return createNotification({
    recipient: mentionedUserId,
    type: 'mention',
    actor: comment.author,
    reference: {
      type: 'comment',
      id: comment._id,
      postId: post._id,
    },
    content: comment.content.substring(0, 100),
  })
}

export async function createPinnedCommentNotification(comment, post, pinner) {
  return createNotification({
    recipient: comment.author._id,
    type: 'pinned_comment',
    actor: pinner,
    reference: {
      type: 'comment',
      id: comment._id,
      postId: post._id || post,
    },
    content: comment.content.substring(0, 100),
  })
}

export async function createNewPostNotification(post, recipientIds) {
  const notifications = recipientIds.map((recipientId) => ({
    recipient: recipientId,
    type: 'new_post',
    actor: {
      _id: post.author._id,
      username: post.author.username,
      displayName: post.author.displayName,
      avatar: post.author.avatar,
    },
    reference: {
      type: 'post',
      id: post._id,
    },
    content: post.content.substring(0, 100),
  }))

  try {
    await Notification.insertMany(notifications)
  } catch (error) {
    console.error('Create new post notifications error:', error)
  }
}

export async function createDirectMessageNotification(message, conversation, recipient) {
  return createNotification({
    recipient: recipient._id,
    type: 'direct_message',
    actor: message.sender,
    reference: {
      type: 'message',
      id: message._id,
    },
    content: message.content ? message.content.substring(0, 100) : (message.image ? '📷 Image' : ''),
  })
}
