//编写程序，从键盘输入一个n(n<=10)本书的名称和定价并存入结构体数组中，
//从中查找定价最高和最低的书，输出该书的名称和定价。
//只能用scanf读入字符串
//存储每个汉字需要2个字节
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
	struct book books[n];
	for(int i=0;i<n;i++) {
		scanf("%59s", books[i].name);//读取名称 
		scanf("%f",&books[i].price);//读取价格  
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
	printf("定价最高的书名称是%s,价格是%.2f\n", books[maxindex].name,books[maxindex].price);
	printf("定价最低的书名称是%s,价格是%.2f\n", books[minindex].name,books[minindex].price);
	return 0;
}
