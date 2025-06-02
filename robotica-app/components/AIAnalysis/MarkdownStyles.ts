import { StyleSheet } from "react-native";

// Estilos específicos para markdown
const markdownStyles = StyleSheet.create({
  body: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  heading1: {
    fontSize: 20,
    marginTop: 12,
    marginBottom: 8,
    color: "#0057A3",
    fontWeight: "bold",
  },
  heading2: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 6,
    color: "#0057A3",
    fontWeight: "bold",
  },
  heading3: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
    color: "#0057A3",
    fontWeight: "bold",
  },
  link: {
    color: "#0057A3",
    textDecorationLine: "underline",
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#0057A3",
    paddingLeft: 12,
    marginLeft: 8,
    fontStyle: "italic",
  },
  strong: {
    fontWeight: "bold",
  },
  em: {
    fontStyle: "italic",
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
    flexDirection: "row",
  },
  code_inline: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: "monospace",
  },
  code_block: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    fontFamily: "monospace",
    marginVertical: 8,
  },
});

export default markdownStyles; 