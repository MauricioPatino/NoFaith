import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  Button, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';

type Reply = {
  id: string;
  content: string;
};

type Topic = {
  id: string;
  title: string;
  description: string;
  replies: Reply[];
};

export default function TopicsScreen() {
  // Topics state holds the list of topics and their replies
  const [topics, setTopics] = useState<Topic[]>([]);
  // State for new topic form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // For inline reply input for each topic; key is topic id.
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  
  const router = useRouter();

  // Adds a new topic to the list
  const addTopic = () => {
    if (!title.trim()) return;
    const newTopic: Topic = {
      id: Date.now().toString(),
      title,
      description,
      replies: []
    };
    setTopics([...topics, newTopic]);
    setTitle('');
    setDescription('');
  };

  // Adds a reply to a specific topic
  const addReply = (topicId: string) => {
    const replyText = replyInputs[topicId];
    if (!replyText?.trim()) return;
    const newReply: Reply = {
      id: Date.now().toString(),
      content: replyText
    };
    const updatedTopics = topics.map(topic => {
      if (topic.id === topicId) {
        return { ...topic, replies: [newReply, ...topic.replies] };
      }
      return topic;
    });
    setTopics(updatedTopics);
    // Clear the reply input for this topic
    setReplyInputs({ ...replyInputs, [topicId]: '' });
  };

  // Renders each topic item along with its replies and a reply input field
  const renderTopicItem = ({ item }: { item: Topic }) => (
    <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
      <Text>{item.description}</Text>

      {/* Discussion Replies */}
      {item.replies.length > 0 ? (
        <FlatList
          data={item.replies}
          keyExtractor={(reply) => reply.id}
          renderItem={({ item: reply }) => (
            <View style={{ paddingVertical: 5, paddingLeft: 10 }}>
              <Text>- {reply.content}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={{ fontStyle: 'italic', paddingVertical: 5 }}>No replies yet.</Text>
      )}

      {/* Inline Reply Input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <TextInput
          placeholder="Write a reply..."
          value={replyInputs[item.id] || ''}
          onChangeText={(text) => setReplyInputs({ ...replyInputs, [item.id]: text })}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            marginRight: 10,
            borderRadius: 5
          }}
        />
        <Button title="Post" onPress={() => addReply(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      {/* New Topic Form */}
      <Text style={{ fontSize: 24, marginBottom: 15 }}>Discussion Topics</Text>
      <View style={{ marginBottom: 20 }}>
        <TextInput
          placeholder="Topic Title"
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }}
        />
        <TextInput
          placeholder="Topic Description"
          value={description}
          onChangeText={setDescription}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }}
        />
        <Button title="Post Topic" onPress={addTopic} />
      </View>

      {/* List of Topics with Discussion */}
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={renderTopicItem}
      />
    </View>
  );
}
