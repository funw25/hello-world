///给定n本书的名称和定价
///查找并输出其中价格最高和最低的书的名称和定价。
///用gets函数读取一行字符串，因为样例中的字符串包含空格。
///另外，用scanf读取一个正整数n后，会有一个回车符，
///需要用getchar()读取这个回车符之后，
///才能用gets函数读取下一行字符串。
///通常，scanf语句中不要加回车符'\n'
#include"stdio.h"
struct book
{
	char name[30];
	float price;
};
int main()
{
	int n;
	scanf("%d",&n);
	getchar();//读取回车符 
	struct book books[n];
	for(int i=0;i<n;i++) {
		gets(books[i].name);//读取名称 
		scanf("%f",&books[i].price);//读取价格 
		getchar();//读取回车符 
	}
	int maxindex=0;
	int minindex=0;
	for(int i=1;i<n;i++){
		if(books[i].price<books[minindex].price){
			minindex=i;
		}
		if(books[i].price>books[maxindex].price){
			maxindex=i;
		}
	}
	printf("%.2f,%s\n", books[maxindex].price,books[maxindex].name);
	printf("%.2f,%s\n", books[minindex].price,books[minindex].name);
	return 0;
}
