//本题要求编写程序，从给定字符串中查找某指定的字符。
//输入的第一行是一个待查找的字符。
//第二行是一个以回车结束的非空字符串（不超过80个字符）。
//如果找到，在一行内按照格式“index = 下标”输出该字符在字符串中所对应的最大下标（下标从0开始）；
//否则输出"Not Found"。
#include"stdio.h"
int main()
{
	char c1;
	int index=-1;
	scanf("%c\n",&c1);
	char a[81];
	gets(a);
	for(int i=0;a[i]!='\0';i++){
		if(a[i]==c1){
			index=i;
		}
	}
	if(index!=-1){
		printf("index = %d",index);
	}
	else{
		printf("Not Found");
	} 
	return 0;
}
