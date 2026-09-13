#include<stdio.h>
struct Student
{
	int age;
	float score;
	char sex;
	/*
	   定义 了一个结构体，里面包含 了三种基本变量 
	            （新的数据类型） 
	            他们成了一个有机组合，可以模拟一些复杂事物 
	*/
	
};
//这上面是在定义一个类型，没有定义变量 

int main(void)
{
	struct Student a={ 18,100,n};//这里定义了一个变量 
	用这个数据类型可以定义变量 
	
	return 0;
}

结构体定义的三种方式：
一， 
#include<stdio.h>
struct Student
{
	int id;
	float score;
	
};
int main(void)
{
	struct Student stu1={18,100};

	return 0;
 }
 
 
 二，
#include<stdio.h>
struct Student 
{
	int id;
	float score;
 } stu1,stu2;
int main(void)
{
	
	return 0;
} 
 
 
三， 
#include<stdio.h>
struct 
{
	int id;
	float score;
 } stu1,stu2;
int main(void)
{
	
	return 0;
} 
 
 
 
怎样使用结构体变量
1.赋值和初始化
#include<stdio.h>
struct Student 
{
	int id;
	float score;
	
};//又忘了分号，， 
int main(void)
{
	struct Student stu1={20,100};//初始化：定义的用时赋值 
	struct Student stu2;//先定义 
	stu2.id=10;
	stu2.score=100;//接下来就只能一个一个赋值了 
	
	
	//初始化可以整体来赋值 ，
    //	赋值只能单个单个赋值 
	printf("%d %f\n",stu1.id,stu1.score);
	printf("%d %f\n",stu2.id,stu2.score);
	return 0;
}

2.如何取出结构体变量中的每一个成员
  ①结构体变量名.成员名
  
  ②指针变量名→成员名 
        #include<stdio.h>
        struct Student 
        {
        	int age;
        	float score;
		};
        int main(void)
        {
        	struct Student st={10,100
			};
        	struct Student* pst;
        	//pst 可以存放前面这个类型变量的地址 
        	pst=&st;
        	
        	pst->age=10;//第二种方式 
        	st.age=10;//第一种方式 
        	
        	
        	return 0;
		}

        pst->age 会被转化成(*pst).age
		一种硬性规定
		
		所以pst->age 等价于(*pst).age 等价于  st.age 
		 
		 我们之所以知道pst->age等价于st.age 是因为pst->age是被转化成了(*pst).age来执行 

   #include<stdio.h>
   struct Student
   {
   	int age;
   	float score;
   	char sex;
   };//一，没有分号 
   int main(void)
   {
   	struct Student st={19,100,'F' };//定义score是float 型，要写100.0 或者100.0F 或者100.0f 
	   struct Student *pst=&st;
	   
	   pst->age=100;
	   st.score=200;
	   
	   printf("%d %f",st.age,st.score);//少了分号 
	   
   	return 0;
   }


3.结构体变量和结构体指针变量作为函数参数传递的问题
#include<stdio.h>
struct Student 
{
	int  age;
	char sex;
	char name[100];
};
void InputStudent(struct Student stu);
int main(void)
{
	struct Student st;//① 
	
	InputStudent(st);//对结构体变量输入 
	printf("%d %c %s \n",st.age,st.sex,st.name);
	//OutputStudent（）；对结构体变量输出
	
	return 0; 
	
 } 

void InputStudent(struct Student stu)//本函数无法修改主函数中①的值 
{//而且是静态分配，在这个函数里赋完值 再进如main函数，stu这个变量就没了 
	stu.age=10;
	strcpy(stu.name,"张三");//不能写成stu.name="张三";
	stu.sex='F';	
}



想修改主函数的值，要发送地址（指针） 


#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student* pstu);
int main(void)
{
	struct Student st; 
	
	InputStudent(&st);//对结构体变量输入 
	printf("%d %c %s \n",st.age,st.sex,st.name);

	return 0; 
	
 } 

void InputStudent(struct Student* pstu)   
//pstu只占 8个字节，
//因为一个变量的地址只用它的第一个字节地地址表示
/*
硬件上是八位一个编号，一个字节一个编号 
一个变量，无论它多大（10000个字节），它的地址只用它的首个字节的地址来表示 
举例子：double* p;
        double x=9.9;
		p=&x;
		p存放的是x的第一个字节的地址，但因为 p是double*类型
		所以编译器知道p指向的是整体八个字节 
		*/
{
	//所以*pstu 代表st 
	//(*pstu).age  等同于st.age
	 (*pstu).age=10;
	 strcpy(pstu->name,"张三");
	 pstu->sex='F';
	 
	
 } 






#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student* pstu);
int main(void)
{
	struct Student st; 
	
	InputStudent(&st);//对结构体变量输入 
	//printf("%d %c %s \n",st.age,st.sex,st.name);
	OutputStudent(st);//对结构体变量输出 
	return 0; 
	
 } 

void InputStudent(struct Student* pstu)   
{
	 (*pstu).age=10;
	 strcpy(pstu->name,"张三");
	 pstu->sex='F';
	 
	
 } 
void OutputStudent(struct Student ss)//ss和st是两个不同的变量 
//现在把 st的值赋给ss，两个的内容一模一样，变成一份拷贝 
//能输出 
{
	printf("%d %c %s\n",ss.age,ss.sex,ss.name); 
}

//用指针 


#include<stdio.h>
struct Student 
{
	int age;
	char sex;
	char name[100];
};
void InputStudent(struct Student* pstu);
void OutputStudent(struct Student ss)； 
int main(void)
{
	struct Student st; 
	
	InputStudent(st);//对结构体变量输入 ，必须 发送st的地址 
	//printf("%d %c %s \n",st.age,st.sex,st.name);
	OutputStudent(st);//对结构体变量输出 ，可以发送st的地址，也可以发送st的内容 
	return 0; 
	
 } 

void InputStudent(struct Student* pstu)   
{
	 (*pstu).age=10;
	 strcpy(pstu->name,"张三");
	 pstu->sex='F';
	 
	
 } 

void OutputStudent(struct Student ss)//ss和st是两个不同的变量 
//现在把 st的值赋给ss，两个的内容一模一样，变成一份拷贝 
//因为没有修改变量内容的要求，所以只是接过来是可以的 
{
	printf("%d %c %s\n",ss.age,ss.sex,ss.name); 
}

发送地址好还是发送内容好？ 
        函数里如果是地址，既可以修改，也可以输出
        推荐发送地址
		
		
		
		 
指针的优点之一：
    快速地传递数据，
    占用内存小
    执行速度快 




举例子：
       动态构造存放学生信息的结构体数组
	      动态构造一个数组 ，存放学生信息
		  然后按分数排序输出 


#include<stdio.h>
#include<malloc.h>

int main(void)
{
	int len;
	printf("请输入学生的个数："\n);
	scanf("%d",&len);
	
	int* pArr;
	pArr=(int*)malloc(len*sizeof(int));//把首字节转为int*  pArr就指向第一个元素了 
	return 0;
}




使用.运算符
使用->
使用（*指针）.变量名
都是那个变量
 




为什么必须用箭头（->）不能用点（.）？
这是一个非常重要的理解点。让我用最简单的方式解释：

核心原因：操作数类型不同
运算符	左侧操作数类型	右侧操作数	含义
.	结构体变量	成员名	访问变量的成员
->	结构体指针	成员名	访问指针指向的结构体成员
详细解释：
情况1：结构体变量用点（.）
c
struct Student {
    char name[20];
    int age;
};

int main() {
    // s1 是一个结构体变量
    struct Student s1;
    
    // 正确的：变量用点运算符
    s1.age = 20;           // 正确！
    strcpy(s1.name, "张三"); // 正确！
    
    return 0;
}
情况2：结构体指针用箭头（->）
c
struct Student {
    char name[20];
    int age;
};

int main() {
    struct Student s1;
    // ptr 是一个结构体指针，指向 s1
    struct Student *ptr = &s1;
    
    // 错误的：指针用点运算符
    // ptr.age = 20;          // 编译错误！
    
    // 正确的：指针用箭头运算符
    ptr->age = 20;           // 正确！
    strcpy(ptr->name, "张三"); // 正确！
    
    return 0;
}

 
 
结构体变量 = 一个房子

结构体指针 = 房子的地址

c
// 如果你站在房子里（变量），直接拿东西用"点"
房子.家具  // 正确

// 如果你只有房子的地址（指针），需要先找到房子再用"箭头"
地址->家具  // 正确：先根据地址找到房子，再拿家具
地址.家具   // 错误：地址本身没有家具，它只是告诉你房子在哪里
 
 
 
 左边是变量名 → 用 .

左边是指针名 → 用 ->
 
 
 
 
 
 
 
 
 // 以下三行代码效果相同：
t.hours = 10;           // 变量用点
ptr->hours = 10;        // 指针用箭头
(*ptr).hours = 10;      // 先解引用，再用点
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
  
